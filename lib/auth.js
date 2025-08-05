const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const Users = require("../db/models/Users");
const UserRoles = require("../db/models/UserRoles");
const config = require("../config");
const RolePrivileges = require("../db/models/RolePrivileges");
const privs = require("../config/role_privileges");
const Response = require("./Response");
const { HTTP_CODES } = require("../config/Enum");
const CustomError = require("./Error");

module.exports = function () {
  let strategy = new Strategy(
    {
      secretOrKey: config.JWT.SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload, done) => {
      try {
        let user = await Users.findOne({ _id: payload.id });
        if (user) {
          // verilen kullanıcının sahip olduğu rol listesi
          // örnek gelen veri          [
          //   { user_id: 1, role_id: 'admin' },
          //   { user_id: 1, role_id: 'editor' }
          // ]
          let userRoles = await UserRoles.find({ user_id: payload.id });

          // map fonksiyonun ürettiği -->  ['admin', 'editor']
          let rolePrivileges = await RolePrivileges.find({
            role_id: { $in: userRoles.map((ur) => ur.role_id) }, // role_id alanı bu role_id'lerden biri olan tüm privilege kayıtlarını getir
          });

          let privileges = rolePrivileges.map((rp) =>
            privs.privileges.find((x) => x.key == rp.permission)
          );

          done(null, {
            id: user._id,
            roles: privileges,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            language: user.language,
            exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME,
          });
        } else {
          done(new Error("User not found"), null);
        }
      } catch (err) {
        done(err, null);
      }
    }
  );

  passport.use(strategy);

  return {
    initialize: function () {
      return passport.initialize();
    },
    authenticate: function () {
      return passport.authenticate("jwt", { session: false });
    },
    checkRoles: (...exprectedRoles) => {
      return (req, res, next) => {
        let i = 0;
        let privileges = req.user.roles.map((x) => x.key);

        while (
          i < exprectedRoles.length &&
          !privileges.includes(exprectedRoles[i])
        )
          i++;

        if (i >= exprectedRoles.length) {
          //error
          let response = Response.errorResponse(
            new CustomError(
              HTTP_CODES.UNAUTHORIZED,
              "Need Permission",
              "Need Permission"
            )
          );
          return res.status(response.code).json(response);
        }
        return next(); // Authorized
      };
    },
  };
};
