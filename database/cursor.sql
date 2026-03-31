DELIMITER $$
CREATE PROCEDURE GetEventCountPerUser()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_user_id INT;
    DECLARE v_name VARCHAR(150);
    DECLARE v_count INT;

    -- declare cursor to loop through all users
    DECLARE user_cursor CURSOR FOR
        SELECT user_id, name FROM users;

    -- declare handler for when cursor reaches the end
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    -- create a temporary table to store results
    CREATE TEMPORARY TABLE IF NOT EXISTS user_event_counts (
        user_id INT,
        name VARCHAR(150),
        total_events INT
    );

    OPEN user_cursor;

    -- loop through each user
    read_loop: LOOP
        FETCH user_cursor INTO v_user_id, v_name;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        -- count events for this user
        SELECT COUNT(*) INTO v_count
        FROM event_participants
        WHERE user_id = v_user_id;

        -- insert into temp table
        INSERT INTO user_event_counts VALUES (v_user_id, v_name, v_count);

    END LOOP;

    CLOSE user_cursor;

    -- return the results
    SELECT * FROM user_event_counts;
    DROP TEMPORARY TABLE user_event_counts;
END$$
DELIMITER ;


CALL GetEventCountPerUser();