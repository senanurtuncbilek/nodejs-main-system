var express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Users = require("../db/models/Users");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const { HTTP_CODES } = require("../config/Enum");
const Enum = require("../config/Enum");
var router = express.Router();
const is = require("is_js");
const UserRoles = require("../db/models/UserRoles");
const Roles = require("../db/models/Roles");
router.get("/", async (req, res) => {
  try {
    let users = await Users.find({});

    res.json(Response.successResponse(users));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/register", async (req, res) => {
  let body = req.body;

  try {
    let user = await Users.findOne({});

    if (user) return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);

    // additional validations will be added!
    // - check email format
    // - enforce minimum password length
    // - validate phone number format
    if (!body.email)
      throw new CustomError(
        HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "email field must be filled"
      );
    if (is.not.email(body.email))
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "email field must be an email format"
      );

    if (!body.password)
      throw new CustomError(
        HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "email field must be filled"
      );

    if (body.password.length < Enum.PASSWORD_LENGTH)
      throw new CustomError(
        HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "password lenght must be greater than"
      );

    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(body.password, salt);

    let createdUser = await Users.create({
      email: body.email,
      password: hash,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
    });

    let role = await Roles.create({
      role_name: Enum.SUPER_ADMIN,
      is_active: true,
      created_by: createdUser._id,
    });

    await UserRoles.create({
      role_id: role._id,
      user_id: createdUser._id,
    });

    res
      .status(Enum.HTTP_CODES.CREATED)
      .json(Response.successResponse({ succes: true }, HTTP_CODES.CREATED));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/add", async (req, res) => {
  let body = req.body;

  try {
    // additional validations will be added!
    // - check email format
    // - enforce minimum password length
    // - validate phone number format
    if (!body.email)
      throw new CustomError(
        HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "email field must be filled"
      );

    if (is.not.email(body.email))
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "email field must be an email format"
      );

    if (!body.password)
      throw new CustomError(
        HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "email field must be filled"
      );

    if (!body.roles || !Array.isArray(body.roles) || body.roles.length == 0)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "roles field must be an array"
      );

    let roles = await Roles.find({ _id: { $in: body.roles } });

    if (roles.length == 0)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "roles field must be an array"
      );

    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(body.password, salt);

    let user = await Users.create({
      email: body.email,
      password: hash,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
    });

    for (let i = 0; i < roles.length; i++) {
      await UserRoles.create({
        role_id: roles[i]._id,
        user_id: user._id,
      });
    }

    res
      .status(Enum.HTTP_CODES.CREATED)
      .json(Response.successResponse({ succes: true }, HTTP_CODES.CREATED));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/update", async (req, res) => {
  try {
    let body = req.body;
    let updates = {};

    if (!body._id)
      throw new CustomError(
        HTTP_CODES.BAD_GATEWAY,
        "Validation Error!",
        "_id field must be filled"
      );

    if (body.password)
      updates.password = await bcrypt.hash(
        body.password,
        await bcrypt.genSalt(saltRounds)
      );

    if (body.first_name) updates.first_name = body.first_name;
    if (body.last_name) updates.last_name = body.last_name;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
    if (body.phone_number) updates.phone_number = body.phone_number;

    if (Array.isArray(body.roles) && body.roles.length > 0) {
      let userRoles = await UserRoles.find({ user_id: body._id });

      let removedRoles = userRoles.filter(
        (x) => !body.roles.includes(x.role_id)
      );
      let newRoles = body.roles.filter(
        (x) => !userRoles.map((r) => r.role_id).includes(x)
      );

      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({
          _id: { $in: removedRoles.map((x) => x._id.toString()) },
        });


      }
      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          let userRole = new UserRoles({
            role_id: newRoles[i],
            user_id: body._id
          });
          await userRole.save();
        }
      }
    }

    let roles = await Roles.find({ _id: { $in: body.roles } });

    if (roles.length == 0)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "roles field must be an array"
      );

    await Users.updateOne({ _id: body._id }, updates);

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/delete", async (req, res) => {
  try {
    let body = req.body;

    if (!body._id)
      throw new CustomError(
        HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "_id field must be filled!"
      );

    await Users.deleteOne({ _id: body._id });

    await UserRoles.deleteMany({ user_id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
