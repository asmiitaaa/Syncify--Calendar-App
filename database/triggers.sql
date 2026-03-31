-- trigger 1: after event is created, automatically log to audit_logs
DELIMITER $$
CREATE TRIGGER after_event_created
AFTER INSERT ON events
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (event_id, action, performed_by, details)
    VALUES (
        NEW.event_id,
        'created',
        NEW.creator_id,
        CONCAT('Event "', NEW.title, '" was created.')
    );
END$$
DELIMITER ;

-- trigger 2: before event is deleted, automatically log to audit_logs
DELIMITER $$
CREATE TRIGGER before_event_delete
BEFORE DELETE ON events
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (event_id, action, performed_by, details)
    VALUES (
        OLD.event_id,
        'deleted',
        OLD.creator_id,
        CONCAT('Event "', OLD.title, '" was deleted.')
    );
END$$
DELIMITER ;

-- procedure: get all dashboard stats for a user in one call
DELIMITER $$
CREATE PROCEDURE get_user_dashboard_stats(IN p_user_id INT)
BEGIN
    SELECT
        (SELECT COUNT(*) FROM events WHERE event_id IN (SELECT event_id FROM event_participants WHERE user_id = p_user_id)) AS total_events,
        (SELECT COUNT(*) FROM event_participants WHERE user_id = p_user_id AND status = 'invited') AS pending_invites,
        (SELECT COUNT(*) FROM events WHERE is_recurring = TRUE AND event_id IN (SELECT event_id FROM event_participants WHERE user_id = p_user_id)) AS recurring_events;

    SELECT visibility, COUNT(*) AS total
    FROM events
    WHERE event_id IN (SELECT event_id FROM event_participants WHERE user_id = p_user_id)
    GROUP BY visibility;
END$$
DELIMITER ;


SELECT * FROM audit_logs ORDER BY action_timestamp DESC LIMIT 5


ALTER TABLE audit_logs 
DROP FOREIGN KEY audit_logs_ibfk_1;

ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_ibfk_1 
FOREIGN KEY (event_id) REFERENCES events(event_id) 
ON DELETE SET NULL;