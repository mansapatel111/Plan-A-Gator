import {
    add_many,
    store_prereqs,
    courses_taken,
    checking_prereqs,
    return_category
  } from "./courseStore.js";
  
  add_many([
    { code: "CIS4930", name: "Special Topics", credits: 3, category: "Core" },
    { code: "CDA3101", name: "Comp Org", credits: 3, category: "Elective" },
  ]);
  
  store_prereqs({ "CIS4930": ["CDA3101"] });
  courses_taken(["CDA3101"]);
  
  console.log("Eligible for CIS4930:", checking_prereqs("CIS4930"));
  console.log("Core courses:", return_category("Core"));