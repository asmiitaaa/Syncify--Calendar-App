create database dbs_project;
use dbs_project;
create table users(user_id int primary key auto_increment, name varchar(150) not null, email varchar(150) unique not null, password varchar(255) not null, created_at timestamp default current_timestamp, is_active boolean default true);
CREATE TABLE events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    creator_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_type ENUM('daily', 'weekly', 'monthly') NULL,
    recurrence_interval INT DEFAULT 1,
    recurrence_end DATE NULL,
    visibility ENUM('private','shared') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE event_participants (
    event_id INT,
    user_id INT,
    role ENUM('creator','participant') DEFAULT 'participant',
    status ENUM('invited','accepted','declined') DEFAULT 'invited',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE event_occurrences (
    occurrence_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    occurrence_start DATETIME NOT NULL,
    occurrence_end DATETIME NOT NULL,
    is_cancelled BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (event_id) REFERENCES events(event_id)
        ON DELETE CASCADE
);
CREATE TABLE reminders (
    reminder_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    remind_before_minutes INT NOT NULL,
    reminder_type ENUM('email','sms','push') DEFAULT 'email',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT,
    notification_type ENUM('event_created','event_updated','reminder') NOT NULL,
    message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id)
        ON DELETE SET NULL
);

CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT,
    action ENUM('created','updated','deleted') NOT NULL,
    performed_by INT,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (event_id) REFERENCES events(event_id)
        ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(user_id)
        ON DELETE SET NULL
);

event_participantsshow tables



