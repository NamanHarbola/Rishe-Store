from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth, firestore, storage as firebase_storage
import razorpay
import base64
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Firebase Admin initialization
firebase_config = os.environ.get('FIREBASE_ADMIN_CREDENTIALS')
if firebase_config:
    cred = credentials.Certificate(json.loads(base64.b64decode(firebase_config)))
    firebase_admin.initialize_app(cred)
else:
    print("Warning: Firebase credentials not configured")

# Razorpay client (test mode)
razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_key'), os.environ.get('RAZORPAY_KEY_SECRET', 'rzp_test_secret')))

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Auth dependency
async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded_token = firebase_auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication: {str(e)}")

# Models
class ProductImage(BaseModel):
    url: str
    alt: str = ""

class ProductVariant(BaseModel):
    color: str
    color_code: str
    sizes: Dict[str, int]  # {"S": 10, "M": 20, ...}

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    images: List[ProductImage]
    variants: List[ProductVariant]
    category: str = "shirts"
    featured: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    images: List[ProductImage]
    variants: List[ProductVariant]
    category: str = "shirts"
    featured: bool = False

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    color: str
    size: str
    quantity: int
    price: float

class ShippingAddress(BaseModel):
    name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state: str
    postal_code: str
    country: str = "India"

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    items: List[OrderItem]
    shipping_address: ShippingAddress
    total_amount: float
    payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    status: str = "pending"  # pending, processing, shipped, delivered, cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class OrderCreate(BaseModel):
    items: List[OrderItem]
    shipping_address: ShippingAddress
    total_amount: float

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str

# Product Routes
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, user: dict = Depends(verify_firebase_token)):
    # Check if user is admin (you can implement admin check logic)
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    await db.products.insert_one(doc)
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/featured", response_model=List[Product])
async def get_featured_products():
    products = await db.products.find({"featured": True}, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductCreate, user: dict = Depends(verify_firebase_token)):
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated_product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(verify_firebase_token)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Review Routes
@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate, user: dict = Depends(verify_firebase_token)):
    review_obj = Review(
        **review.model_dump(),
        user_id=user['uid'],
        user_name=user.get('name', user.get('email', 'Anonymous'))
    )
    doc = review_obj.model_dump()
    await db.reviews.insert_one(doc)
    return review_obj

@api_router.get("/reviews/{product_id}", response_model=List[Review])
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(1000)
    return reviews

# Order Routes
@api_router.post("/orders/create-razorpay-order")
async def create_razorpay_order(order_data: OrderCreate, user: dict = Depends(verify_firebase_token)):
    # Create order in MongoDB
    order_obj = Order(
        **order_data.model_dump(),
        user_id=user['uid'],
        user_email=user.get('email', '')
    )
    
    # Create Razorpay order
    razorpay_order = razorpay_client.order.create({
        "amount": int(order_data.total_amount * 100),  # Convert to paise
        "currency": "INR",
        "payment_capture": 1
    })
    
    order_obj.razorpay_order_id = razorpay_order['id']
    doc = order_obj.model_dump()
    await db.orders.insert_one(doc)
    
    return {
        "order_id": order_obj.id,
        "razorpay_order_id": razorpay_order['id'],
        "amount": razorpay_order['amount'],
        "currency": razorpay_order['currency']
    }

@api_router.post("/orders/verify-payment")
async def verify_payment(payment: PaymentVerification, user: dict = Depends(verify_firebase_token)):
    # Verify payment signature
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payment.razorpay_order_id,
            'razorpay_payment_id': payment.razorpay_payment_id,
            'razorpay_signature': payment.razorpay_signature
        })
        
        # Update order status
        await db.orders.update_one(
            {"id": payment.order_id},
            {"$set": {
                "payment_id": payment.razorpay_payment_id,
                "status": "processing",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update inventory
        order = await db.orders.find_one({"id": payment.order_id})
        if order:
            for item in order['items']:
                product = await db.products.find_one({"id": item['product_id']})
                if product:
                    # Update stock for specific variant and size
                    for variant in product['variants']:
                        if variant['color'] == item['color']:
                            if item['size'] in variant['sizes']:
                                variant['sizes'][item['size']] = max(0, variant['sizes'][item['size']] - item['quantity'])
                    await db.products.update_one(
                        {"id": item['product_id']},
                        {"$set": {"variants": product['variants']}}
                    )
        
        return {"success": True, "message": "Payment verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")

@api_router.get("/orders/my-orders", response_model=List[Order])
async def get_my_orders(user: dict = Depends(verify_firebase_token)):
    orders = await db.orders.find({"user_id": user['uid']}, {"_id": 0}).to_list(1000)
    # Sort by created_at descending
    orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return orders

@api_router.get("/orders", response_model=List[Order])
async def get_all_orders(user: dict = Depends(verify_firebase_token)):
    # Admin only
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return orders

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, user: dict = Depends(verify_firebase_token)):
    # Admin only
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Order status updated successfully"}

# Analytics Routes
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(user: dict = Depends(verify_firebase_token)):
    # Admin only
    total_orders = await db.orders.count_documents({})
    total_revenue = 0
    orders = await db.orders.find({"status": {"$in": ["processing", "shipped", "delivered"]}}, {"_id": 0}).to_list(10000)
    
    for order in orders:
        total_revenue += order.get('total_amount', 0)
    
    total_products = await db.products.count_documents({})
    
    # Get recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    # Sales by status
    status_counts = {}
    all_orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
    for order in all_orders:
        status = order.get('status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_products": total_products,
        "recent_orders": recent_orders,
        "status_counts": status_counts
    }

@api_router.get("/analytics/inventory")
async def get_inventory_analytics(user: dict = Depends(verify_firebase_token)):
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    
    inventory_data = []
    for product in products:
        total_stock = 0
        for variant in product.get('variants', []):
            for size, stock in variant.get('sizes', {}).items():
                total_stock += stock
        
        inventory_data.append({
            "id": product['id'],
            "name": product['name'],
            "total_stock": total_stock,
            "variants": product.get('variants', [])
        })
    
    return inventory_data

# Health check
@api_router.get("/")
async def root():
    return {"message": "Rishè API is running"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()