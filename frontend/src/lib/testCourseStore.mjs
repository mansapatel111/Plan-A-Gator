import {
    add_many,
    store_prereqs,
    courses_taken,
    checking_prereqs,
    return_category,
    recommend_courses,
  } from "./courseStore.js";
  
  add_many([
    { code: "CIS4930", name: "Special Topics", credits: 3, category: "Core" },
    { code: "CDA3101", name: "Comp Org", credits: 3, category: "Elective" },
  ]);
  
  store_prereqs({ "CIS4930": ["CDA3101"] });
  courses_taken(["CDA3101"]);
  
  console.log("Eligible for CIS4930:", checking_prereqs("CIS4930"));
  console.log("Core courses:", return_category("Core"));
  
  add_many([
    { code: "COP3502", name: "Programming I", credits: 3, category: "Core" },
    { code: "COP3503", name: "Programming II", credits: 3, category: "Core" },
    { code: "CDA3101", name: "Computer Org", credits: 3, category: "Core" },
    { code: "MAC2311", name: "Calculus I", credits: 4, category: "GenEd" },
  ]);
  
  store_prereqs({
    COP3503: ["COP3502"],
    CDA3101: ["COP3503"],
  });
  
  courses_taken(["COP3502"]);
  
  console.log("Recommend Core:", recommend_courses({ course_category: "Core", options_returned: 4 }));
  console.log("Recommend All:", recommend_courses({ options_returned: 3 }));
  