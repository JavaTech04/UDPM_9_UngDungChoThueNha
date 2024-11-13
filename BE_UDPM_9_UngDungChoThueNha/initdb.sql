-- Create 'user' table with default timestamps for 'created_at' and 'updated_at'
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create 'home' table with 'user_id' column and foreign key constraint
CREATE TABLE home (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    address VARCHAR(255) NOT NULL,
    price BIGINT NOT NULL,
    quantity INT NOT NULL,
    image_url VARCHAR(255),
    user_id INT,
    CONSTRAINT fk_user_home FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Insert sample data into 'user' table
INSERT INTO user (username, email, password) VALUES
('user1', 'user1@example.com', 'password1'),
('user2', 'user2@example.com', 'password2'),
('user3', 'user3@example.com', 'password3'),
('user4', 'user4@example.com', 'password4'),
('user5', 'user5@example.com', 'password5');

-- Insert sample data into 'home' table
INSERT INTO home (address, price, quantity, image_url, user_id) VALUES
('123 Main St, City A', 2500000, 3, 'home1.jpg', 1),
('456 Maple Ave, City B', 3000000, 2, 'home2.jpg', 2),
('789 Oak St, City C', 1500000, 5, 'home3.jpg', 3),
('101 Pine St, City D', 4000000, 1, 'home4.jpg', 4),
('202 Cedar Ave, City E', 2000000, 4, 'home5.jpg', 5);
