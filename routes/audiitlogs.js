const express = require("express");
const router = express.Router();
const moment = require("moment");
const Response = require("../lib/Response");
const AuditLogs = require("../db/models/AuditLogs");
const auth = require("../lib/auth")();

router.all("*", auth.authenticate(), (res, req, next) =>{
  next();
});

router.post("/", auth.checkRoles("auditlogs_view"), async (req, res) => {
  try {
    let body = req.body;
    let query = {};
    if (body.begin_date && body.end_date) {
      query.created_at = {
        $gte: moment(body.begin_date),
        $lte: moment(body.end_date),
      };
    } else {
      query.created_at = {
        $gte: moment().subtract(1, "day").startOf("day"),
        $lte: moment(),
      };
    }
    let auditLogs = await AuditLogs.find(query)
      .sort({ created_at: -1 })
      .skip(body.skip || 0)
      .limit(500);

    res.json(Response.successResponse(auditLogs));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
