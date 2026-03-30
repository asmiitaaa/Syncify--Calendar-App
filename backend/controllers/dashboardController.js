const db = require("../db");

//route get/api/dashboard/stats
//access is private access

const getDashboardStats = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    //calling the stored procedure to get all dashboard stats in one call
    //SQL QUERY
    const [rows] = await db
      .promise()
      .query("CALL get_user_dashboard_stats(?)", [user_id]);

    const stats = rows[0][0]; // first result set, first row
    const eventsByVisibility = rows[1]; // second result set

    res.json({
      total_events: stats.total_events,
      pending_invites: stats.pending_invites,
      recurring_events: stats.recurring_events,
      events_by_visibility: eventsByVisibility,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats };
