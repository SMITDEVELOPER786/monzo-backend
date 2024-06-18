const { OAuth2Client } = require("google-auth-library");
const config = require("dotenv");

// config();
exports.accessTokenValidator = async (accessToken, socialType) => {
  const { GOOGLE_CLIENT_ID } = process.env;
  let name, identifier, dateOfBirth, profilePic, gender, imageUrl;
  console.log(GOOGLE_CLIENT_ID);
  switch (socialType) {
    case "facebook": {
      return {
        hasError: true,
        message: "Facebook app id or secret is not provided",
      };
      break;
    }

    case "google": {
        try {
            const client = new OAuth2Client(GOOGLE_CLIENT_ID);
            const googleResponse = await client.verifyIdToken({
              idToken: accessToken,
            });
    
            const data = googleResponse.getPayload();
    
            if (!data.aud && data.error) {
              return {
                hasError: true,
                message: data.error.message,
              };
            }
    
            const { name, picture: imageUrl, email: identifier } = data;
    
            return {
              hasError: false,
              message: "Token verified successfully",
              data: { name, imageUrl, identifier },
            };
          } catch (error) {
            // Handle the invalid token signature error and other potential errors
            return {
              hasError: true,
              message: error.message,
              data:{}
            };
          }
    }
  }
  return {
    hasError: false,
    data: {
      name,
      imageUrl,
      identifier,
    },
  };
};
