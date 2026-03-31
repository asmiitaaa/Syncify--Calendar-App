-- new trigger
DELIMITER $$
CREATE TRIGGER after_event_update
AFTER UPDATE ON events
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (event_id, action, performed_by, details)
  VALUES (NEW.event_id, 'updated', NEW.creator_id, CONCAT('Event "', NEW.title, '" updated'));
END$$
DELIMITER ;

-- new procedures and function
DELIMITER $$
CREATE PROCEDURE GetUserEvents(IN p_user_id INT)
BEGIN
  SELECT e.* FROM events e
  WHERE e.event_id IN (SELECT event_id FROM event_participants WHERE user_id = p_user_id);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE GetUpcomingReminders()
BEGIN
  SELECT r.*, u.email, u.name, e.title, e.start_datetime
  FROM reminders r
  JOIN users u ON r.user_id = u.user_id
  JOIN events e ON r.event_id = e.event_id
  WHERE DATE_SUB(e.start_datetime, INTERVAL r.remind_before_minutes MINUTE) <= NOW()
  AND e.start_datetime >= NOW();
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION CountUserEvents(p_user_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE total INT;
  SELECT COUNT(*) INTO total FROM event_participants WHERE user_id = p_user_id;
  RETURN total;
END$$
DELIMITER ;

select * from audit_logs;