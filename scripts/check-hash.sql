SELECT email, LEFT("passwordHash", 10) as hash_start, LENGTH("passwordHash") as hash_length FROM users WHERE role = 'ADMIN';
