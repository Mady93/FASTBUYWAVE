from api_client import ApiClient
import json

"""
HOW TO RUN THIS SCRIPT:

1. Open VS Code terminal (Ctrl + `)
2. Make sure you are in the project root folder
3. Run the command:
   python test_api.py
"""

client = ApiClient("user@example.com", "Password2.prova")
client.login()

# Marketplace category structure
"""
category_data = {
    "label": "Marketplace",
    "icon": "faThLarge",
    "active": true,
    "link": "marketplace",
    "name": "Marketplace",
    "children": [
        {
            "label": "Electronics",
            "icon": "faMobileAlt",
            "active": true,
            "link": "marketplace/electronics",
            "name": "Electronics",
            "children": [
                {
                    "label": "Smartphones and Accessories",
                    "icon": "faMobileAlt",
                    "active": true,
                    "link": "marketplace/electronics/smartphones",
                    "name": "Smartphones",
                    "children": []
                },
                {
                    "label": "Computers and Tablets",
                    "icon": "faLaptop",
                    "active": true,
                    "link": "marketplace/electronics/computers",
                    "name": "Computers",
                    "children": []
                },
                {
                    "label": "TV and Home Theater",
                    "icon": "faTelevision",
                    "active": true,
                    "link": "marketplace/electronics/tv",
                    "name": "TV",
                    "children": []
                },
                {
                    "label": "Consoles and Video Games",
                    "icon": "faGamepad",
                    "active": true,
                    "link": "marketplace/electronics/consoles",
                    "name": "Consoles",
                    "children": []
                },
                {
                    "label": "Audio & Hi-Fi",
                    "icon": "faHeadphones",
                    "active": true,
                    "link": "marketplace/electronics/audio",
                    "name": "Audio",
                    "children": []
                },
                {
                    "label": "Photography and Cameras",
                    "icon": "faCamera",
                    "active": true,
                    "link": "marketplace/electronics/cameras",
                    "name": "Cameras",
                    "children": []
                },
                {
                    "label": "Drones and Robotics",
                    "icon": "faRocket",
                    "active": true,
                    "link": "marketplace/electronics/drones",
                    "name": "Drones",
                    "children": []
                }
            ]
        },
        {
            "label": "Clothing",
            "icon": "faTshirt",
            "active": true,
            "link": "marketplace/clothing",
            "name": "Clothing",
            "children": [
                {
                    "label": "Men",
                    "icon": "faUser",
                    "active": true,
                    "link": "marketplace/clothing/men",
                    "name": "Men",
                    "children": [
                        {
                            "label": "Tshirts",
                            "icon": "faTshirt",
                            "active": true,
                            "link": "marketplace/clothing/men/tshirts",
                            "name": "Tshirts",
                            "children": []
                        },
                        {
                            "label": "Jackets",
                            "icon": "faUserTie",
                            "active": true,
                            "link": "marketplace/clothing/men/jackets",
                            "name": "Jackets",
                            "children": []
                        },
                        {
                            "label": "Trousers",
                            "icon": "faTshirt",
                            "active": true,
                            "link": "marketplace/clothing/men/trousers",
                            "name": "Trousers",
                            "children": []
                        },
                        {
                            "label": "Shoes",
                            "icon": "faShoePrints",
                            "active": true,
                            "link": "marketplace/clothing/men/shoes",
                            "name": "Shoes",
                            "children": []
                        }
                    ]
                },
                {
                    "label": "Women",
                    "icon": "faUser",
                    "active": true,
                    "link": "marketplace/clothing/women",
                    "name": "Women",
                    "children": [
                        {
                            "label": "Dresses",
                            "icon": "faGem",
                            "active": true,
                            "link": "marketplace/clothing/women/dresses",
                            "name": "Dresses",
                            "children": []
                        },
                        {
                            "label": "Skirts",
                            "icon": "faGem",
                            "active": true,
                            "link": "marketplace/clothing/women/skirts",
                            "name": "Skirts",
                            "children": []
                        },
                        {
                            "label": "Womenshoes",
                            "icon": "faShoePrints",
                            "active": true,
                            "link": "marketplace/clothing/women/shoes",
                            "name": "Womenshoes",
                            "children": []
                        },
                        {
                            "label": "Bags",
                            "icon": "faShoppingBag",
                            "active": true,
                            "link": "marketplace/clothing/women/bags",
                            "name": "Bags",
                            "children": []
                        }
                    ]
                },
                {
                    "label": "Kids",
                    "icon": "faChild",
                    "active": true,
                    "link": "marketplace/clothing/kids",
                    "name": "Kids",
                    "children": [
                        {
                            "label": "Baby",
                            "icon": "faBaby",
                            "active": true,
                            "link": "marketplace/clothing/kids/baby",
                            "name": "Baby",
                            "children": []
                        },
                        {
                            "label": "Child",
                            "icon": "faChild",
                            "active": true,
                            "link": "marketplace/clothing/kids/child",
                            "name": "Child",
                            "children": []
                        },
                        {
                            "label": "Teen",
                            "icon": "faUser",
                            "active": true,
                            "link": "marketplace/clothing/kids/teen",
                            "name": "Teen",
                            "children": []
                        },
                        {
                            "label": "Kidshoes",
                            "icon": "faShoePrints",
                            "active": true,
                            "link": "marketplace/clothing/kids/kidshoes",
                            "name": "Kidshoes",
                            "children": []
                        }
                    ]
                }
            ]
        },
        {
            "label": "Home and Garden",
            "icon": "faChair",
            "active": true,
            "link": "marketplace/furniture",
            "name": "Home_garden",
            "children": [
                {
                    "label": "Furniture",
                    "icon": "faChair",
                    "active": true,
                    "link": "marketplace/home/furniture",
                    "name": "Furniture",
                    "children": []
                },
                {
                    "label": "Decorations",
                    "icon": "faGem",
                    "active": true,
                    "link": "marketplace/home/decor",
                    "name": "Decor",
                    "children": []
                },
                {
                    "label": "Home Appliances",
                    "icon": "faPlug",
                    "active": true,
                    "link": "marketplace/home/appliances",
                    "name": "Appliances",
                    "children": []
                },
                {
                    "label": "Garden & Outdoors",
                    "icon": "faTree",
                    "active": true,
                    "link": "marketplace/home/garden",
                    "name": "Garden",
                    "children": []
                }
            ]
        },
        {
            "label": "Sports and Leisure",
            "icon": "faFootballBall",
            "active": true,
            "link": "marketplace/sports",
            "name": "Sports",
            "children": [
                {
                    "label": "Fitness & Gym",
                    "icon": "faDumbbell",
                    "active": true,
                    "link": "marketplace/sports/fitness",
                    "name": "Fitness",
                    "children": []
                },
                {
                    "label": "Bicycles",
                    "icon": "faBicycle",
                    "active": true,
                    "link": "marketplace/sports/bikes",
                    "name": "Bikes",
                    "children": []
                },
                {
                    "label": "Water Sports",
                    "icon": "faWater",
                    "active": true,
                    "link": "marketplace/sports/water",
                    "name": "Water_sport",
                    "children": []
                },
                {
                    "label": "Camping & Outdoors",
                    "icon": "faTree",
                    "active": true,
                    "link": "marketplace/sports/camping",
                    "name": "Camping",
                    "children": []
                }
            ]
        },
        {
            "label": "Vehicles",
            "icon": "faTruck",
            "active": true,
            "link": "marketplace/vehicles",
            "name": "Vehicles",
            "children": [
                {
                    "label": "Cars",
                    "icon": "faCar",
                    "active": true,
                    "link": "marketplace/vehicles/cars",
                    "name": "Cars",
                    "children": []
                },
                {
                    "label": "Motorcycles",
                    "icon": "faMotorcycle",
                    "active": true,
                    "link": "marketplace/vehicles/motorcycles",
                    "name": "Motorcycles",
                    "children": []
                },
                {
                    "label": "Bikes",
                    "icon": "faBicycle",
                    "active": true,
                    "link": "marketplace/vehicles/bikes",
                    "name": "Bikes",
                    "children": []
                },
                {
                    "label": "Boats",
                    "icon": "faShip",
                    "active": true,
                    "link": "marketplace/vehicles/boats",
                    "name": "Boats",
                    "children": []
                }
            ]
        },
        {
            "label": "Art, Books, and Collectibles",
            "icon": "faPalette",
            "active": true,
            "link": "marketplace/art",
            "name": "Art",
            "children": [
                {
                    "label": "Books",
                    "icon": "faBook",
                    "active": true,
                    "link": "marketplace/art/books",
                    "name": "Books",
                    "children": []
                },
                {
                    "label": "Vinyl Records & Music",
                    "icon": "faMusic",
                    "active": true,
                    "link": "marketplace/art/music",
                    "name": "Music",
                    "children": []
                },
                {
                    "label": "Art & Paintings",
                    "icon": "faPalette",
                    "active": true,
                    "link": "marketplace/art/paintings",
                    "name": "Paintings",
                    "children": []
                },
                {
                    "label": "Collectibles",
                    "icon": "faArchive",
                    "active": true,
                    "link": "marketplace/art/collectibles",
                    "name": "Collectibles",
                    "children": []
                }
            ]
        }
    ]
}

result = client.create_category(category_data)
print(json.dumps(result.json(), indent=2))
"""

user = client.get_user_by_id(2)
print(json.dumps(user.json(), indent=2))

products = client.get_products_by_user_id(1)
print(json.dumps(products.json(), indent=2)[:3000])
print("... (troncato)")

comments = client.get_comments_tree(69)
print(json.dumps(comments.json(), indent=2))

cart = client.get_cart()
print(json.dumps(cart.json(), indent=2))

orders = client.get_user_orders()
print(json.dumps(orders.json(), indent=2))

client.logout()