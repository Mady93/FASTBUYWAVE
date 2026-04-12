import requests
import base64
import json

BASE_URL = "http://localhost:8080"

class ApiClient:
    def __init__(self, email, password):
        self.email = email
        self.password = password
        self.access_token = None
        self.refresh_token = None
        self.session = requests.Session()

    # --- AUTH ---
    def register(self):
        """Registra un nuovo utente usando email e password."""
        payload = {
            "email": self.email,
            "password": self.password
        }
        try:
            response = self.session.post(f"{BASE_URL}/api/auth/register", json=payload)
            if response.status_code in [200, 201]:
                print(f"🟢 Registration successful for {self.email}")
            elif response.status_code == 400:
                print(f"⚠️ User {self.email} might already exist — skipping registration")
            else:
                print(f"❌ Registration failed with status {response.status_code}")
                response.raise_for_status()
        except requests.RequestException as e:
            print(f"❌ Error during registration: {e}")

    def login(self):
        """Login e salva access/refresh token dai cookie"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.email,
            "password": self.password
        })
        response.raise_for_status()

        cookie = self.session.cookies.get("tokens")
        if not cookie:
            raise Exception("Login failed: tokens cookie not found")

        decoded = base64.b64decode(cookie).decode("utf-8")
        tokens = json.loads(decoded)
        self.access_token = tokens.get("accessToken")
        self.refresh_token = tokens.get("refreshToken")
        print("🟢 Login successful")

    def refresh(self):
        if not self.refresh_token:
            raise Exception("No refresh token available")

        response = self.session.post(f"{BASE_URL}/api/auth/refresh", json={
            "refreshToken": self.refresh_token
        })
        response.raise_for_status()
        data = response.json()
        self.access_token = data.get("accessToken")
        print("🔄 Token refreshed")

    def logout(self):
        if self.access_token:
            self.session.post(f"{BASE_URL}/api/auth/logout",
                              headers={"Authorization": f"Bearer {self.access_token}"})
        self.access_token = None
        self.refresh_token = None
        print("🟢 Logout done")

    def change_password(self, user_id, new_password):
        """Change user password"""
        return self._request("PUT", f"/api/auth/changePassword/{user_id}", json={"newPassword": new_password})

    # --- HELPER ---
    def _request(self, method, endpoint, **kwargs):
        if not self.access_token:
            self.login()

        headers = kwargs.pop("headers", {})
        headers["Authorization"] = f"Bearer {self.access_token}"
        kwargs["headers"] = headers

        response = self.session.request(method, f"{BASE_URL}{endpoint}", **kwargs)

        # If token expired, try to refresh it
        if response.status_code == 401:
            self.refresh()
            headers["Authorization"] = f"Bearer {self.access_token}"
            kwargs["headers"] = headers
            response = self.session.request(method, f"{BASE_URL}{endpoint}", **kwargs)

        # Log generic errors
        if response.status_code >= 400:
            print(f"⚠️ Request failed: {response.status_code} - {response.text}")

        return response

    # --- BATCH ENDPOINTS ---
    def run_batch_job(self, table_name):
        """Run batch job for a specific table"""
        return self._request("POST", f"/api/batch/run/{table_name}")

    # --- CART ENDPOINTS ---
    def get_cart(self):
        """Get current user's cart"""
        return self._request("GET", "/api/v1/cart")

    def add_to_cart(self, product_id, quantity):
        """Add item to cart"""
        payload = {"productId": product_id, "quantity": quantity}
        return self._request("POST", "/api/v1/cart/items", json=payload)

    def update_cart_item(self, cart_item_id, quantity):
        """Update cart item quantity"""
        payload = {"quantity": quantity}
        return self._request("PUT", f"/api/v1/cart/items/{cart_item_id}", json=payload)

    def remove_from_cart(self, cart_item_id):
        """Remove item from cart"""
        return self._request("DELETE", f"/api/v1/cart/items/{cart_item_id}")

    def clear_cart(self):
        """Clear entire cart"""
        return self._request("DELETE", "/api/v1/cart")

    # --- ORDER ENDPOINTS ---
    def create_order(self, address_id, payment_method):
        """Create order from cart"""
        payload = {"addressId": address_id, "paymentMethod": payment_method}
        return self._request("POST", "/api/v1/orders", json=payload)

    def get_user_orders(self):
        """Get all orders for current user"""
        return self._request("GET", "/api/v1/orders")

    def get_order_by_id(self, order_id):
        """Get order details by ID"""
        return self._request("GET", f"/api/v1/orders/{order_id}")

    def update_order_status(self, order_id, status):
        """Update order status (ADMIN only)"""
        return self._request("PUT", f"/api/v1/orders/{order_id}/status?status={status}")

    # --- PAYMENT ENDPOINTS ---
    def initiate_payment(self, order_id, payment_method, use_mock=False):
        """Initiate payment for an order"""
        payload = {
            "orderId": order_id,
            "paymentMethod": payment_method,
            "useMockPayment": use_mock
        }
        return self._request("POST", "/api/v1/payments/initiate", json=payload)

    def confirm_payment(self, payment_reference, transaction_id, use_mock=False):
        """Confirm payment via webhook"""
        return self._request("POST", f"/api/v1/payments/webhook/confirm?paymentReference={payment_reference}&transactionId={transaction_id}&useMockPayment={use_mock}")

    def handle_payment_failure(self, payment_reference, failure_reason):
        """Handle payment failure"""
        return self._request("POST", f"/api/v1/payments/webhook/failure?paymentReference={payment_reference}&failureReason={failure_reason}")

    # --- APPOINTMENT ENDPOINTS ---
    def get_appointment_by_id(self, appointment_id):
        """Get appointment by ID"""
        return self._request("GET", f"/api/appointments/{appointment_id}")

    def get_appointments_by_requester(self, user_id):
        """Get appointments where user is requester"""
        return self._request("GET", f"/api/appointments/requester/{user_id}")

    def get_appointments_by_organizer(self, user_id):
        """Get appointments where user is organizer"""
        return self._request("GET", f"/api/appointments/organizer/{user_id}")

    def get_all_user_appointments(self, user_id):
        """Get all appointments for a user"""
        return self._request("GET", f"/api/appointments/user/{user_id}/all")

    def get_confirmed_appointments(self, user_id):
        """Get confirmed appointments for a user"""
        return self._request("GET", f"/api/appointments/user/{user_id}/confirmed")

    def get_calendar_appointments(self, user_id, year, month):
        """Get calendar appointments for a specific month"""
        return self._request("GET", f"/api/appointments/user/{user_id}/calendar?year={year}&month={month}")

    def get_today_appointments(self, user_id):
        """Get today's appointments"""
        return self._request("GET", f"/api/appointments/user/{user_id}/today")

    def get_week_appointments(self, user_id):
        """Get this week's appointments"""
        return self._request("GET", f"/api/appointments/user/{user_id}/week")

    def get_appointments_by_date_range(self, user_id, start_date, end_date):
        """Get appointments in date range"""
        return self._request("GET", f"/api/appointments/user/{user_id}/range?start={start_date}&end={end_date}")

    def get_appointment_statistics(self, user_id):
        """Get appointment statistics"""
        return self._request("GET", f"/api/appointments/stats/{user_id}")

    def confirm_appointment(self, appointment_id, user_id):
        """Confirm an appointment"""
        return self._request("PATCH", f"/api/appointments/{appointment_id}/confirm?userId={user_id}")

    def cancel_appointment(self, appointment_id, user_id, reason=None):
        """Cancel an appointment"""
        url = f"/api/appointments/{appointment_id}/cancel?userId={user_id}"
        if reason:
            url += f"&reason={reason}"
        return self._request("PATCH", url)

    def reschedule_appointment(self, appointment_id, new_datetime, reason=None):
        """Reschedule an appointment"""
        url = f"/api/appointments/{appointment_id}/reschedule?newDatetime={new_datetime}"
        if reason:
            url += f"&reason={reason}"
        return self._request("PATCH", url)

    def complete_appointment(self, appointment_id, rating=None, feedback=None):
        """Complete an appointment"""
        url = f"/api/appointments/{appointment_id}/complete"
        if rating:
            url += f"?rating={rating}"
        if feedback:
            url += f"&feedback={feedback}" if "?" in url else f"?feedback={feedback}"
        return self._request("PATCH", url)

    def update_appointment_location(self, appointment_id, address, notes=None):
        """Update appointment location"""
        url = f"/api/appointments/{appointment_id}/location?address={address}"
        if notes:
            url += f"&notes={notes}"
        return self._request("PATCH", url)

    # --- APPOINTMENT PROPOSAL ENDPOINTS ---
    def propose_change(self, appointment_id, user_id, proposed_datetime=None, proposed_location=None, proposed_duration=None, reason=None):
        """Propose a change to an appointment"""
        payload = {}
        if proposed_datetime:
            payload["proposedDateTime"] = proposed_datetime
        if proposed_location:
            payload["proposedLocation"] = proposed_location
        if proposed_duration:
            payload["proposedDuration"] = proposed_duration
        if reason:
            payload["reason"] = reason
        return self._request("POST", f"/api/appointment/proposals/create/{appointment_id}?userId={user_id}", json=payload)

    def accept_proposal(self, proposal_id, user_id):
        """Accept a proposal"""
        return self._request("POST", f"/api/appointment/proposals/{proposal_id}/accept?userId={user_id}")

    def reject_proposal(self, proposal_id, user_id):
        """Reject a proposal"""
        return self._request("POST", f"/api/appointment/proposals/{proposal_id}/reject?userId={user_id}")

    def get_proposals_by_appointment(self, appointment_id):
        """Get all proposals for an appointment"""
        return self._request("GET", f"/api/appointment/proposals/{appointment_id}")

    # --- CONTACT REQUEST ENDPOINTS ---
    def create_contact_request(self, receiver_id, product_id, request_type, message=None):
        """Create a contact request"""
        payload = {
            "receiverId": receiver_id,
            "productId": product_id,
            "type": request_type,
            "message": message
        }
        return self._request("POST", "/api/contact/requests", json=payload)

    def accept_contact_request(self, request_id):
        """Accept a contact request"""
        return self._request("PATCH", f"/api/contact/requests/{request_id}/accept")

    def reject_contact_request(self, request_id, rejection_reason=None):
        """Reject a contact request"""
        payload = {}
        if rejection_reason:
            payload["rejectionReason"] = rejection_reason
        return self._request("PATCH", f"/api/contact/requests/{request_id}/reject", json=payload)

    def get_contact_request_by_id(self, request_id):
        """Get contact request by ID"""
        return self._request("GET", f"/api/contact/requests/{request_id}")

    def get_contact_requests_by_receiver(self, user_id):
        """Get requests received by user"""
        return self._request("GET", f"/api/contact/requests/receiver/{user_id}")

    def get_contact_requests_by_sender(self, user_id):
        """Get requests sent by user"""
        return self._request("GET", f"/api/contact/requests/sender/{user_id}")

    def hide_contact_request(self, request_id):
        """Hide a contact request"""
        return self._request("PATCH", f"/api/contact/requests/{request_id}/hide")

    # --- DASHBOARD ENDPOINTS ---
    def get_dashboard_stats(self, period="30d"):
        """Get dashboard statistics"""
        return self._request("GET", f"/api/dashboard/stats?period={period}")

    def get_revenue_timeline(self, period="30d"):
        """Get revenue timeline"""
        return self._request("GET", f"/api/dashboard/revenue?period={period}")

    def get_top_products(self, limit=6, period="30d"):
        """Get top selling products"""
        return self._request("GET", f"/api/dashboard/top-products?limit={limit}&period={period}")

    def get_category_stats(self, period="30d"):
        """Get category statistics"""
        return self._request("GET", f"/api/dashboard/categories?period={period}")

    def get_upcoming_appointments(self, limit=10, period="30d"):
        """Get upcoming appointments for current user"""
        return self._request("GET", f"/api/dashboard/appointments?limit={limit}&period={period}")

    # --- ADDRESS ENDPOINTS ---
    def create_address(self, payload):
        """Create a new address"""
        return self._request("POST", "/api/address/create", json=payload)

    def update_address(self, payload):
        """Update an existing address"""
        return self._request("PUT", "/api/address/update", json=payload)

    def delete_address(self, address_id):
        """Soft delete address by ID"""
        return self._request("DELETE", f"/api/address/delete/{address_id}")

    def get_address_by_id(self, address_id):
        """Get address by ID"""
        return self._request("GET", f"/api/address/get/{address_id}")

    def get_all_addresses(self):
        """Get all addresses (active and inactive)"""
        return self._request("GET", "/api/address/get/all")

    def get_active_addresses(self):
        """Get all active addresses"""
        return self._request("GET", "/api/address/get/all/active")

    def get_inactive_addresses(self):
        """Get all inactive addresses"""
        return self._request("GET", "/api/address/get/all/inactive")

    def get_active_addresses_paginated(self, page=0, size=10, sort="id,asc"):
        """Get paginated active addresses"""
        return self._request("GET", f"/api/address/get/all/active/paginated?page={page}&size={size}&sort={sort}")

    def get_inactive_addresses_paginated(self, page=0, size=10, sort="id,asc"):
        """Get paginated inactive addresses"""
        return self._request("GET", f"/api/address/get/all/inactive/paginated?page={page}&size={size}&sort={sort}")

    def count_active_addresses(self):
        """Count active addresses"""
        return self._request("GET", "/api/address/count/active")

    def count_inactive_addresses(self):
        """Count inactive addresses"""
        return self._request("GET", "/api/address/count/inactive")

    # --- ADVERTISEMENT ENDPOINTS ---
    def create_advertisement(self, advertisement, product, address, category, image_files, user_id):
        """
        Create a new advertisement with product, address, category and images
        Requires multipart/form-data
        """
        files = []
        for i, img in enumerate(image_files):
            files.append(('images', (f'image_{i}.jpg', img, 'image/jpeg')))
        
        data = {
            'advertisement': (None, json.dumps(advertisement), 'application/json'),
            'product': (None, json.dumps(product), 'application/json'),
            'address': (None, json.dumps(address), 'application/json'),
            'category': (None, json.dumps(category), 'application/json'),
            'userId': (None, str(user_id))
        }
        return self._request("POST", "/api/advertisements/create", files=files, data=data)

    def renew_advertisement(self, advertisement):
        """Renew an advertisement"""
        return self._request("PUT", "/api/advertisements/renew", json=advertisement)

    # --- CATEGORY ENDPOINTS ---
    def create_category(self, payload):
        """Create a new category"""
        return self._request("POST", "/api/category/create", json=payload)

    def update_category(self, payload):
        """Update a category"""
        return self._request("PUT", "/api/category/update", json=payload)

    def delete_category(self, category_id):
        """Soft delete a category"""
        return self._request("DELETE", f"/api/category/delete/{category_id}")

    def delete_child_category(self, category_id, child_category_id):
        """Delete a child category"""
        return self._request("DELETE", f"/api/category/delete/{category_id}/child/{child_category_id}")

    def get_category_by_id(self, category_id):
        """Get active category by ID"""
        return self._request("GET", f"/api/category/get/{category_id}")

    def get_deleted_category_by_id(self, category_id):
        """Get deleted category by ID"""
        return self._request("GET", f"/api/category/get/deleted/{category_id}")

    def get_category_by_name(self, name):
        """Get category by name"""
        return self._request("GET", f"/api/category/get/name/{name}")

    def category_exists_by_name(self, name):
        """Check if category exists by name"""
        return self._request("GET", f"/api/category/exists/name/{name}")

    def get_all_categories(self):
        """Get all categories"""
        return self._request("GET", "/api/category/get/all")

    def get_active_categories(self):
        """Get all active categories"""
        return self._request("GET", "/api/category/get/active")

    def get_inactive_categories(self):
        """Get all inactive categories"""
        return self._request("GET", "/api/category/get/not/active")

    def get_active_categories_paginated(self, page=0, size=10, sort="name,asc"):
        """Get paginated active categories"""
        return self._request("GET", f"/api/category/active/paginated?page={page}&size={size}&sort={sort}")

    def get_inactive_categories_paginated(self, page=0, size=10, sort="name,asc"):
        """Get paginated inactive categories"""
        return self._request("GET", f"/api/category/not/active/paginated?page={page}&size={size}&sort={sort}")

    def count_active_categories(self):
        """Count active categories"""
        return self._request("GET", "/api/category/count/active")

    def count_inactive_categories(self):
        """Count inactive categories"""
        return self._request("GET", "/api/category/count/not/active")

    def delete_all_categories(self):
        """Delete all categories (DEPRECATED)"""
        return self._request("DELETE", "/api/category/delete/all")

    def activate_all_categories(self):
        """Activate all child categories"""
        return self._request("PUT", "/api/category/activate/all")

    def deactivate_all_categories(self):
        """Deactivate all child categories"""
        return self._request("PUT", "/api/category/deactivate/all")

    def get_category_by_path(self, path):
        """Get category by slash-separated path"""
        return self._request("GET", f"/api/category/get/path?path={path}")

    def get_category_by_link(self, link):
        """Get category by link"""
        return self._request("GET", f"/api/category/get/link?link={link}")

    # --- COMMENT ENDPOINTS ---
    def get_comments_tree(self, advertisement_id):
        """Get comment tree for an advertisement"""
        return self._request("GET", f"/api/comments/get/advertisement/{advertisement_id}")

    def create_root_comment(self, advertisement_id, content, user_id):
        """Create a root comment on an advertisement"""
        return self._request("POST", f"/api/comments/create/advertisement/{advertisement_id}?content={content}&userId={user_id}")

    def create_reply(self, parent_id, content, user_id):
        """Reply to a comment"""
        return self._request("POST", f"/api/comments/create/{parent_id}/reply?content={content}&userId={user_id}")

    def update_comment(self, comment_id, content, user_id):
        """Update a comment"""
        return self._request("PUT", f"/api/comments/update/{comment_id}?content={content}&userId={user_id}")

    def delete_comment(self, comment_id, user_id):
        """Delete a comment"""
        return self._request("DELETE", f"/api/comments/delete/{comment_id}?userId={user_id}")

    # --- IMAGE ENDPOINTS ---
    def count_active_images(self):
        """Count active images"""
        return self._request("GET", "/api/image/count")

    def get_images_paginated(self, page=0, size=10):
        """Get paginated list of active images"""
        return self._request("GET", f"/api/image/get?page={page}&size={size}")

    def count_deleted_images(self):
        """Count deleted images"""
        return self._request("GET", "/api/image/countDeleted")

    def get_deleted_images_paginated(self, page=0, size=10):
        """Get paginated list of deleted images"""
        return self._request("GET", f"/api/image/getDeleted?page={page}&size={size}")

    def get_all_images(self):
        """Get all active images as list"""
        return self._request("GET", "/api/image/getListImage")

    def get_active_images_by_product(self, product_id):
        """Get active images by product ID"""
        return self._request("GET", f"/api/image/getListImage/active/{product_id}")

    def get_inactive_images_by_product(self, product_id):
        """Get inactive images by product ID"""
        return self._request("GET", f"/api/image/getListImage/not/active/{product_id}")

    def upload_images(self, product_id, files):
        """Upload images for a product (requires multipart/form-data)"""
        files_payload = [('files', (f'file_{i}.jpg', f, 'image/jpeg')) for i, f in enumerate(files)]
        return self._request("POST", f"/api/image/add?immId={product_id}", files=files_payload)

    def get_image_by_id(self, image_id):
        """Get image by ID"""
        return self._request("GET", f"/api/image/{image_id}/one")

    def update_images(self, files, ids):
        """Update multiple images"""
        files_payload = [('files', (f'file_{i}.jpg', f, 'image/jpeg')) for i, f in enumerate(files)]
        return self._request("PUT", f"/api/image/update?ids={ids}", files=files_payload)

    def delete_image(self, image_id):
        """Soft delete an image"""
        return self._request("DELETE", f"/api/image/{image_id}/delete")

    def delete_all_images(self):
        """Soft delete all images"""
        return self._request("DELETE", "/api/image/deleteAll")

    # --- PRODUCT ENDPOINTS ---
    def count_products(self):
        """Count active products"""
        return self._request("GET", "/api/products/count")

    def count_deleted_products(self):
        """Count deleted products"""
        return self._request("GET", "/api/products/deleted/count")

    def get_deleted_products_paginated(self, page=0, size=10, sort="id,asc"):
        """Get paginated list of deleted products"""
        return self._request("GET", f"/api/products/deleted?page={page}&size={size}&sort={sort}")

    def create_product(self, product, address_id):
        """Create a new product"""
        return self._request("POST", f"/api/products/{address_id}", json=product)

    def get_product_by_id(self, product_id):
        """Get product by ID"""
        return self._request("GET", f"/api/products/{product_id}")

    def update_product(self, product_id, product):
        """Update product price and active status"""
        return self._request("PUT", f"/api/products/{product_id}", json=product)

    def delete_product(self, product_id):
        """Soft delete a product"""
        return self._request("DELETE", f"/api/products/{product_id}")

    def delete_all_products(self):
        """Soft delete all products"""
        return self._request("DELETE", "/api/products")

    def get_products_by_user_id(self, user_id):
        """Get all active products by user ID"""
        return self._request("GET", f"/api/products/getProduct/active/{user_id}")

    def search_products(self, product_type, **filters):
        """
        Search products by type and filters
        Filters: country, city, minPrice, maxPrice, title, condition, agency, minDate, maxDate
        """
        criteria = {"type": product_type}
        criteria.update(filters)
        return self._request("POST", "/api/products/list/not/delete", json=criteria)

    def hard_delete_product(self, product_id):
        """Permanently delete a product (IRREVERSIBLE)"""
        return self._request("DELETE", f"/api/products/hard/{product_id}")

    def hard_delete_all_products(self):
        """Permanently delete all products (IRREVERSIBLE)"""
        return self._request("DELETE", "/api/products/hard")
    

    # --- PROFILE ENDPOINTS ---
    def create_profile(self, profile, address, user_id, profile_picture=None):
        """Create a new profile with address and optional profile picture"""
        files = []
        data = {
            'profile': (None, json.dumps(profile), 'application/json'),
            'address': (None, json.dumps(address), 'application/json'),
            'userId': (None, str(user_id))
        }
        if profile_picture:
            files.append(('profilePicture', ('profile.jpg', profile_picture, 'image/jpeg')))
        return self._request("POST", "/api/profiles/create", files=files, data=data)

    def update_profile(self, user_id, profile, address, profile_picture=None):
        """Update an existing profile"""
        files = []
        data = {
            'userId': (None, str(user_id)),
            'profile': (None, json.dumps(profile), 'application/json'),
            'address': (None, json.dumps(address), 'application/json')
        }
        if profile_picture:
            files.append(('profilePicture', ('profile.jpg', profile_picture, 'image/jpeg')))
        return self._request("PUT", "/api/profiles/update", files=files, data=data)

    def get_profile_by_id(self, profile_id):
        """Get profile by profile ID"""
        return self._request("GET", f"/api/profiles/{profile_id}")

    def get_profile_by_user_id(self, user_id):
        """Get profile by user ID"""
        return self._request("GET", f"/api/profiles/user/{user_id}")

    def delete_profile(self, profile_id):
        """Soft delete a profile"""
        return self._request("DELETE", f"/api/profiles/{profile_id}")

    def delete_all_profiles(self):
        """Soft delete all profiles"""
        return self._request("DELETE", "/api/profiles/all")

    def count_profiles(self):
        """Count active profiles"""
        return self._request("GET", "/api/profiles/count")

    def count_deleted_profiles(self):
        """Count deleted profiles"""
        return self._request("GET", "/api/profiles/count-deleted")

    def get_profiles_paginated(self, page=0, size=10, sort="id,asc"):
        """Get paginated list of active profiles"""
        return self._request("GET", f"/api/profiles?page={page}&size={size}&sort={sort}")

    def get_deleted_profiles_paginated(self, page=0, size=10, sort="id,asc"):
        """Get paginated list of deleted profiles"""
        return self._request("GET", f"/api/profiles/deleted?page={page}&size={size}&sort={sort}")

    def get_profile_picture(self, user_id):
        """Get profile picture as binary"""
        return self._request("GET", f"/api/profiles/user/{user_id}/picture")

    def get_profile_picture_base64(self, user_id):
        """Get profile picture as Base64 string"""
        return self._request("GET", f"/api/profiles/user/{user_id}/picture-base64")

    # --- LIKE ENDPOINTS ---
    def update_likes(self, user_id, advertisement_id, like_request):
        """Create or update a like for an advertisement"""
        return self._request("PUT", f"/api/likes/create/update/{user_id}/{advertisement_id}", json=like_request)

    def get_user_likes(self, user_id):
        """Get all liked advertisements by user"""
        return self._request("GET", f"/api/likes/likes/user?userId={user_id}")

    def get_advertisement_likes(self, advertisement_id):
        """Get all users who liked an advertisement"""
        return self._request("GET", f"/api/likes/advertisement/{advertisement_id}")

    # --- USER ENDPOINTS ---
    def get_user_by_email(self, email):
        """Get user by email"""
        return self._request("GET", f"/api/user/email?email={email}")

    def count_users(self):
        """Count active users"""
        return self._request("GET", "/api/user/count")

    def get_users_paginated(self, page=0, size=10, sort="email,asc"):
        """Get paginated active users"""
        return self._request("GET", f"/api/user/all?page={page}&size={size}&sort={sort}")

    def count_deleted_users(self):
        """Count deleted users"""
        return self._request("GET", "/api/user/count-deleted")

    def get_deleted_users_paginated(self, page=0, size=10, sort="email,asc"):
        """Get paginated deleted users"""
        return self._request("GET", f"/api/user/deleted?page={page}&size={size}&sort={sort}")

    def get_user_by_id(self, user_id):
        """Get user by ID"""
        return self._request("GET", f"/api/user/get/{user_id}")

    def update_user(self, user_id, payload):
        """Update user by ID"""
        return self._request("PUT", f"/api/user/update/{user_id}", json=payload)

    def delete_user(self, user_id):
        """Soft delete user by ID"""
        return self._request("DELETE", f"/api/user/delete/{user_id}")

    def delete_all_users(self):
        """Delete all non-ADMIN users"""
        return self._request("DELETE", "/api/user/delete/all")

    def reactivate_all_users(self):
        """Reactivate all inactive users"""
        return self._request("PUT", "/api/user/reactivate/all")

    def get_all_active_users(self):
        """Get all active users as list"""
        return self._request("GET", "/api/user/list/active")