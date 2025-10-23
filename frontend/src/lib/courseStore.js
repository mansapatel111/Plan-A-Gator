/*
using maps/sets
creating 1. by code which stores course info , want key - value pairs
2. by category whichwill store a set for either prereq, elective, core , want category with set of codes
3. prereqs which will store the info prereqs specified for that course , want course with list of prereqs
4. taken which will store the set of classes taken parsed from transcript , set bc just collection of values
*/

const by_course = new Map();
const by_category = new Map();
const prereqs = new Map();
const has_taken = new Set();

// makes sure every course object has same consistent format
function course_formatted(raw){
    const course = {};

    // making course code uppercase
    if (raw.code){
        course.code = raw.code.toUpperCase();
    } else{
        course.code = "";
    }

    course.name = raw.name || "";
    course.credits = raw.credits || 0;
    course.difficulty = raw.difficulty || "Unknown";
    course.professor = raw.professor || "TBA";
    course.category = raw.category || "Uncategorized";

    return course;
}

/*
add courses function which verifies format then adds to by_course and the code to by_category
mainly for testing or if want to add single course
*/
function add_course(raw) {
    const formatted = course_formatted(raw);

    // if no code then skip
    if (!formatted.code){
        return;
    }

    by_course.set(formatted.code, formatted);

    // index course code under correct category, if no category then create
    let sort_sets = by_category.get(formatted.category);
    if (!sort_sets){
        sort_sets = new Set();
        by_category.set(formatted.category, sort_sets);
    }

    sort_sets.add(formatted.code);
}

/*
add many courses using the add_course function, puts course in by_course and indexes by_category
*/
function add_many(list){
    if (list == null){
        return;
    }

    for (let i = 0; i< list.length; i++){
        const item = list[i];
        add_course(item);
    }
}

/*
storing prereq mappings in the prereqs map
input maps a course and returns array of required courses
*/
function store_prereqs(object_info){
    if (object_info == null){
        return;
    }

    const course_codes = Object.keys(object_info)

    for (let i = 0; i < course_codes.length; i++){
        const key_course = course_codes[i];
        const prereq_list = object_info[key_course];
        const format_course = key_course.toUpperCase();
        // to store clean array of prereqs
        const empty = [];

        // if contains full array then read through
        if (Array.isArray(prereq_list)){
            for (let j = 0; j < prereq_list.length; j++){
                const prereq_code = prereq_list[j];
                if (prereq_code){
                    empty.push(prereq_code.toUpperCase());
                }
            }
        }
        // checking that main course code isnt empty
        if (format_course !== ""){
            prereqs.set(format_course, empty);
        }
    }
}
/*
marking which courses are completed by adding them in the has_taken set
set used for no duplicates
*/
function courses_taken(completed){
    if (completed == null){
        return;
    }

    for (let i = 0; i < completed.length; i++){
        const class_code = completed[i];
        if (class_code){
            has_taken.add(class_code.toUpperCase());
        }
    }
}

/*
checking if prereqs have been completed for course
returns true if all list of prereqs are in has_taken
*/
function checking_prereqs(course_code){
    if (!course_code){
        return false;
    }

    const format_code = course_code.toUpperCase();
    const prereqs_set = prereqs.get(format_code);

    if (!prereqs_set || prereqs_set.length === 0){
        return true;
    }

    // checking that every prereq shows up in has_taken
    for (let i=0; i < prereqs_set.length; i++){
        const requirement = prereqs_set[i];
        if (!has_taken.has(requirement)){
            return false;
        }
    }
    return true;
}

// function to return courses by category or return all
function return_category(category_name){
    // if no category given then returns all objects from by_course
    if (!category_name){
        const return_courses = [];
        const return_values = by_course.values();
        let next = return_values.next();

        // iterating through all values in by_course
        while (!next.done){
            return_courses.push(next.value);
            next = return_values.next();
        }
        return return_courses;
    }
    
    // if category is given then checks that set of courses
    const set_codes = by_category.get(category_name);
    if (!set_codes){
        return [];
    }
    
    // list of course objects for given category
    const list_of_courses = [];
    const codes = set_codes.values();
    let next_code = codes.next();

    while (!next_code.done){
        const code = next_code.value;
        const course = by_course.get(code);
        if (course){
            list_of_courses.push(course);
        }
        next_code = codes.next();
    }
    
    return list_of_courses;
}

/*
adding recommend function which will be main part of scheduler
1. suggesting up to 4 classes (maybe more if category all?)
2. can limit 1 category - either elective, core, gened
3. doesnt suggest courses that have already been taken
4. courses only suggested when prereq returns true
*/
function recommend_courses(choices){
    if (choices == null){
        choices = {};
    }

    // gets category but if category not given then default to all
    // gets number of items to return , defaults to 4
    const course_category = choices.course_category || null;
    let options_returned = Number(choices.options_returned);
    if (!Number.isFinite(options_returned) || options_returned <= 0){
        options_returned = 4;
    }

    // creating a pool of courses to choose from, if a category is chosen then the pool is that category
    // using by_course.values as iterator
    let options;
    if (course_category){
        options = return_category(course_category);
    } else {
        options = [];
        const temp = by_course.values();
        let next = temp.next();
        while (!next.done){
            options.push(next.value);
            next = temp.next();
        }
    }

    /*
    filter the classes using rules
    1) valid course code 2) no courses in has_taken 3) only if prereqs satisfied
    */
    const filter = [];
    for (let i = 0; i < options.length; i++){
        const course = options[i];

        if (!course || !course.code){
            continue;
        }

        if (has_taken.has(course.code)){
            continue;
        }

        if (!checking_prereqs(course.code)){
            continue;
        }

        filter.push(course);

        if (filter.length >= options_returned){
            break;
        }
    }
    return filter;
}

export {
    add_course,
    add_many,
    store_prereqs,
    courses_taken,
    checking_prereqs,
    return_category,
    recommend_courses,
    by_course,
    by_category,
    prereqs,
    has_taken
  };