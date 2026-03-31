DELIMITER $$
CREATE PROCEDURE CheckEventCount(IN p_user_id INT)
BEGIN
    DECLARE total INT;
    
    SELECT COUNT(*) INTO total
    FROM event_participants
    WHERE user_id = p_user_id;
    
    IF total > 5 THEN
        SELECT CONCAT('User ', p_user_id, ' is very active with ', total, ' events') AS message;
    ELSEIF total > 0 THEN
        SELECT CONCAT('User ', p_user_id, ' has ', total, ' events') AS message;
    ELSE
        SELECT CONCAT('User ', p_user_id, ' has no events') AS message;
    END IF;
END$$
DELIMITER ;


CALL CheckEventCount(1);