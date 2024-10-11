const prisma = require("../src/PrismaClient");

async function main() {
  const facilities = [
    {
      facility_code: "GPITG",
      verify_token: "GPITG-2009-KW-DSM",
    },
    {
      facility_code: "ARRH",
      verify_token: "ARRH-2013-IL-DSM",
    },
    {
      facility_code: "DRRH",
      verify_token: "DRRH-2020-IL-DOM",
    },
  ];

  for (const facility of facilities) {
    await prisma.facilities.create({
      data: facility,
    });
    console.log(facility?.facility_code + "  Added Successfully");
  }

  console.log("Facilities seeded successfully!");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    prisma.$disconnect();
  });
