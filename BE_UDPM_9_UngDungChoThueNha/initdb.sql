CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

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
('Ha Noi 1', 2500000, 3, 'https://th.bing.com/th/id/OIP.xD3a4PqNGdW9NC3CHI82JgAAAA?rs=1&pid=ImgDetMain', 1),
('Ha Noi 2', 3000000, 2, 'https://th.bing.com/th/id/R.38985e6da8945547bb31b9abf82f267e?rik=sBI6Ok9ockOCAw&pid=ImgRaw&r=0', 2),
('Ha Noi 3', 1500000, 5, 'https://www.apartments.com/rental-manager/sites/default/files/image/2023-02/nine-steps-to-turn-your-home-into-a-rental-property_hero.jpg', 3),
('Ha Noi 4', 4000000, 1, 'https://th.bing.com/th/id/OIP.AbY5n74K5jiRL0rhXHJ6lQHaFi?rs=1&pid=ImgDetMain', 4),
('Ha Noi 5', 2000000, 4, 'https://a0.muscache.com/im/pictures/prohost-api/Hosting-964780713002684826/original/8a72be11-b95f-4370-945a-88b86897d5f4.jpeg?im_w=720&width=720&quality=70&auto=webp', 5);
