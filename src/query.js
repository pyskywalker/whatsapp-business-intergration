const prisma = require("./PrismaClient");

function query(modelName) {
  const model = prisma[modelName];

  if (!model) {
    throw new Error(`Model ${modelName} does not exist in Prisma schema`);
  }

  return new Proxy(model, {
    get(target, prop) {
      if (typeof target[prop] === "function") {
        return async (...args) => {
          try {
            const result = await target[prop](...args);
            return result;
          } catch (error) {
            // Default error logging
            console.error(
              `Error occurred in ${modelName} model's ${prop} method:`,
              error
            );
            throw error; // Optionally re-throw if you want to handle this elsewhere
          } finally {
            // Default final logging
            console.info(`${prop} method on ${modelName} model executed.`);
          }
        };
      } else {
        return target[prop];
      }
    },
  });
}

module.exports = query;
