Command:
curl -s -X POST http://localhost:5000/customer/login -H "Content-Type: application/json" -d "{\"username\": \"testuser\", \"password\": \"testpassword\"}" -c cookie.txt

Output:
{"message":"Customer successfully logged in"}
