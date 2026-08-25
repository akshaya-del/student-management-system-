function showPage(pageId) {
    if (pageId === "dashboardPage") {
        var user = JSON.parse(localStorage.getItem("scCurrentUser"));
        if (!user) {
            pageId = "loginPage";
        } else {
            document.getElementById("welcomeUser").innerHTML = user.name;
            renderStudents();
            renderEnrollments();
            populateMaterialCourseSelect();
        }
    }

    var pages = document.getElementsByClassName("page");
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove("active");
    }
    document.getElementById(pageId).classList.add("active");
}

function doRegister(e) {
    e.preventDefault();
    var name = document.getElementById("regName").value;
    var email = document.getElementById("regEmail").value;
    var username = document.getElementById("regUsername").value;
    var password = document.getElementById("regPassword").value;
    var confirmPassword = document.getElementById("regConfirmPassword").value;
    var msg = document.getElementById("registerMsg");

    function showError(text) {
        msg.style.display = "block";
        msg.style.backgroundColor = "#fbe9e9";
        msg.style.color = "#d64545";
        msg.innerHTML = text;
    }

    if (!name || !email || !username || !password) {
        showError("Please fill in all fields.");
        return;
    }
    if (password.length < 6) {
        showError("Password must be at least 6 characters.");
        return;
    }
    if (password !== confirmPassword) {
        showError("Passwords do not match.");
        return;
    }

    var users = JSON.parse(localStorage.getItem("scUsers")) || [];
    var exists = users.some(function(u) { return u.username === username; });
    if (exists) {
        showError("That username is already taken.");
        return;
    }

    users.push({ name: name, email: email, username: username, password: password });
    localStorage.setItem("scUsers", JSON.stringify(users));

    msg.style.display = "block";
    msg.style.backgroundColor = "#e4f6ec";
    msg.style.color = "#2e9e5b";
    msg.innerHTML = "Account created! Redirecting to login...";

    setTimeout(function() {
        showPage("loginPage");
        msg.style.display = "none";
    }, 1200);
}

function doLogin(e) {
    e.preventDefault();
    var username = document.getElementById("loginUsername").value;
    var password = document.getElementById("loginPassword").value;
    var msg = document.getElementById("loginMsg");

    var users = JSON.parse(localStorage.getItem("scUsers")) || [];
    var found = users.find(function(u) {
        return u.username === username && u.password === password;
    });

    if (!found) {
        msg.style.display = "block";
        msg.style.backgroundColor = "#fbe9e9";
        msg.style.color = "#d64545";
        msg.innerHTML = "Invalid username or password.";
        return;
    }

    localStorage.setItem("scCurrentUser", JSON.stringify(found));
    msg.style.display = "block";
    msg.style.backgroundColor = "#e4f6ec";
    msg.style.color = "#2e9e5b";
    msg.innerHTML = "Login successful! Redirecting...";

    setTimeout(function() {
        msg.style.display = "none";
        showPage("dashboardPage");
    }, 800);
}

function doLogout() {
    localStorage.removeItem("scCurrentUser");
    showPage("loginPage");
}

var selectedCourse = null;

function selectCourse(courseName) {
    selectedCourse = courseName;
    var cards = document.getElementsByClassName("course-card");
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove("selected");
    }
    var clickedCard = document.querySelector('[data-course="' + courseName + '"]');
    clickedCard.classList.add("selected");

    document.getElementById("enrollBtn").disabled = false;
}

function getEnrollments() {
    return JSON.parse(localStorage.getItem("scEnrollments")) || [];
}
function saveEnrollments(list) {
    localStorage.setItem("scEnrollments", JSON.stringify(list));
}

function enrollInCourse() {
    var user = JSON.parse(localStorage.getItem("scCurrentUser"));
    var msg = document.getElementById("enrollMsg");

    if (!selectedCourse) {
        return;
    }

    var enrollments = getEnrollments();

    var alreadyEnrolled = enrollments.some(function(en) {
        return en.username === user.username && en.course === selectedCourse;
    });

    if (alreadyEnrolled) {
        msg.style.display = "block";
        msg.style.backgroundColor = "#fbe9e9";
        msg.style.color = "#d64545";
        msg.innerHTML = "You are already enrolled in " + selectedCourse + ".";
        return;
    }

    enrollments.push({ username: user.username, course: selectedCourse });
    saveEnrollments(enrollments);

    msg.style.display = "block";
    msg.style.backgroundColor = "#e4f6ec";
    msg.style.color = "#2e9e5b";
    msg.innerHTML = "Successfully enrolled in " + selectedCourse + "!";

    renderEnrollments();
    populateMaterialCourseSelect();
}

function unenrollCourse(courseName) {
    if (!confirm("Unenroll from " + courseName + "?")) return;

    var user = JSON.parse(localStorage.getItem("scCurrentUser"));
    var enrollments = getEnrollments().filter(function(en) {
        return !(en.username === user.username && en.course === courseName);
    });
    saveEnrollments(enrollments);
    renderEnrollments();
    populateMaterialCourseSelect();
}

function renderEnrollments() {
    var user = JSON.parse(localStorage.getItem("scCurrentUser"));
    if (!user) return;

    var enrollments = getEnrollments().filter(function(en) {
        return en.username === user.username;
    });

    var list = document.getElementById("enrolledList");
    list.innerHTML = "";

    if (enrollments.length === 0) {
        list.innerHTML = "<li style='justify-content:center; color:#6b7280;'>No courses enrolled yet.</li>";
        return;
    }

    enrollments.forEach(function(en) {
        var item = document.createElement("li");
        item.innerHTML =
            "<span><span class='badge'>Enrolled</span>&nbsp; " + en.course + "</span>" +
            "<button class='btn-del' onclick=\"unenrollCourse('" + en.course + "')\">Unenroll</button>";
        list.appendChild(item);
    });
}

/* ================= COURSE MATERIAL & TEST ================= */

var courseMaterials = {
    "Java": {
        materials: [
            "Introduction to OOP: classes, objects, and constructors",
            "Inheritance, polymorphism, and interfaces",
            "Exception handling with try/catch/finally",
            "Collections framework: List, Set, and Map"
        ],
        quiz: [
            {
                question: "Which keyword is used to inherit a class in Java?",
                options: ["extends", "implements", "inherits", "super"],
                answer: 0
            },
            {
                question: "Which of these is NOT a Java access modifier?",
                options: ["public", "private", "protected", "internal"],
                answer: 3
            },
            {
                question: "Which block is always executed in exception handling?",
                options: ["try", "catch", "finally", "throw"],
                answer: 2
            }
        ]
    },
    "Python": {
        materials: [
            "Variables, data types, and basic operators",
            "Lists, tuples, and dictionaries",
            "Functions, arguments, and lambda expressions",
            "Working with modules and pip packages"
        ],
        quiz: [
            {
                question: "Which symbol is used for comments in Python?",
                options: ["//", "#", "/* */", "--"],
                answer: 1
            },
            {
                question: "Which data type is immutable in Python?",
                options: ["List", "Dictionary", "Tuple", "Set"],
                answer: 2
            },
            {
                question: "What does the 'len()' function do?",
                options: ["Returns the type", "Returns the length", "Rounds a number", "Sorts a list"],
                answer: 1
            }
        ]
    },
    "Full Stack": {
        materials: [
            "HTML5 semantics and CSS3 layout (Flexbox/Grid)",
            "JavaScript DOM manipulation and events",
            "Building REST APIs with Node.js/Express",
            "Connecting frontend to backend and databases"
        ],
        quiz: [
            {
                question: "Which HTTP method is typically used to update a resource?",
                options: ["GET", "PUT", "DELETE", "OPTIONS"],
                answer: 1
            },
            {
                question: "Which CSS property is used for flexible box layout?",
                options: ["display: flex", "position: flex", "float: flex", "flex: box"],
                answer: 0
            },
            {
                question: "In REST, which method usually creates a new resource?",
                options: ["GET", "POST", "HEAD", "PATCH"],
                answer: 1
            }
        ]
    },
    "Data Science": {
        materials: [
            "Descriptive statistics: mean, median, and standard deviation",
            "Data cleaning and preprocessing with pandas",
            "Data visualization basics with matplotlib",
            "Introduction to machine learning concepts"
        ],
        quiz: [
            {
                question: "Which library is commonly used for data manipulation in Python?",
                options: ["pandas", "flask", "requests", "django"],
                answer: 0
            },
            {
                question: "What does 'mean' represent in statistics?",
                options: ["Middle value", "Most frequent value", "Average value", "Range of values"],
                answer: 2
            },
            {
                question: "Which type of learning uses labeled data?",
                options: ["Unsupervised", "Supervised", "Reinforcement", "Clustering"],
                answer: 1
            }
        ]
    }
};

var currentQuizCourse = null;
var currentQuizAnswers = [];

function getTestResults() {
    return JSON.parse(localStorage.getItem("scTestResults")) || [];
}
function saveTestResults(list) {
    localStorage.setItem("scTestResults", JSON.stringify(list));
}

function populateMaterialCourseSelect() {
    var user = JSON.parse(localStorage.getItem("scCurrentUser"));
    var select = document.getElementById("materialCourseSelect");
    select.innerHTML = '<option value="">-- Select a course --</option>';

    if (!user) return;

    var enrolled = getEnrollments().filter(function(en) {
        return en.username === user.username;
    });

    enrolled.forEach(function(en) {
        var opt = document.createElement("option");
        opt.value = en.course;
        opt.innerHTML = en.course;
        select.appendChild(opt);
    });

    document.getElementById("materialContent").style.display = "none";
}

function loadCourseMaterial() {
    var course = document.getElementById("materialCourseSelect").value;
    var content = document.getElementById("materialContent");

    if (!course) {
        content.style.display = "none";
        return;
    }

    var data = courseMaterials[course];
    if (!data) {
        content.style.display = "none";
        return;
    }

    document.getElementById("materialTitle").innerHTML = course + " - Study Material";

    var list = document.getElementById("materialList");
    list.innerHTML = "";
    data.materials.forEach(function(item) {
        var li = document.createElement("li");
        li.innerHTML = item;
        list.appendChild(li);
    });

    document.getElementById("quizBox").style.display = "none";
    document.getElementById("quizBox").innerHTML = "";
    document.getElementById("testResultBanner").style.display = "none";
    document.getElementById("startTestBtn").style.display = "inline-block";

    content.style.display = "block";
    renderTestHistory();
}

function startTest() {
    var course = document.getElementById("materialCourseSelect").value;
    var data = courseMaterials[course];
    if (!data) return;

    currentQuizCourse = course;
    currentQuizAnswers = new Array(data.quiz.length).fill(null);

    document.getElementById("testResultBanner").style.display = "none";
    document.getElementById("startTestBtn").style.display = "none";

    var box = document.getElementById("quizBox");
    box.innerHTML = "";

    data.quiz.forEach(function(q, qIndex) {
        var qDiv = document.createElement("div");
        qDiv.className = "quiz-question";

        var qText = document.createElement("p");
        qText.className = "q-text";
        qText.innerHTML = (qIndex + 1) + ". " + q.question;
        qDiv.appendChild(qText);

        q.options.forEach(function(opt, oIndex) {
            var label = document.createElement("label");
            label.className = "quiz-option";
            label.innerHTML =
                "<input type='radio' name='q" + qIndex + "' value='" + oIndex + "' onchange='recordAnswer(" + qIndex + "," + oIndex + ")'> " + opt;
            qDiv.appendChild(label);
        });

        box.appendChild(qDiv);
    });

    var submitBtn = document.createElement("button");
    submitBtn.className = "btn submit-test-btn";
    submitBtn.innerHTML = "Submit Test";
    submitBtn.onclick = submitTest;
    box.appendChild(submitBtn);

    box.style.display = "block";
}

function recordAnswer(qIndex, oIndex) {
    currentQuizAnswers[qIndex] = oIndex;
}

function submitTest() {
    var data = courseMaterials[currentQuizCourse];
    if (!data) return;

    var unanswered = currentQuizAnswers.some(function(a) { return a === null; });
    if (unanswered) {
        alert("Please answer all questions before submitting.");
        return;
    }

    var score = 0;
    data.quiz.forEach(function(q, i) {
        if (currentQuizAnswers[i] === q.answer) {
            score++;
        }
    });

    var total = data.quiz.length;
    var percent = Math.round((score / total) * 100);
    var passed = percent >= 60;

    var user = JSON.parse(localStorage.getItem("scCurrentUser"));
    var results = getTestResults();
    results.push({
        username: user.username,
        course: currentQuizCourse,
        score: score,
        total: total,
        percent: percent,
        passed: passed,
        date: new Date().toLocaleString()
    });
    saveTestResults(results);

    var banner = document.getElementById("testResultBanner");
    banner.className = passed ? "result-pass" : "result-fail";
    banner.innerHTML = "You scored " + score + "/" + total + " (" + percent + "%) - " + (passed ? "Passed!" : "Try again!");
    banner.style.display = "block";

    document.getElementById("quizBox").style.display = "none";
    document.getElementById("quizBox").innerHTML = "";
    document.getElementById("startTestBtn").style.display = "inline-block";

    renderTestHistory();
}

function renderTestHistory() {
    var user = JSON.parse(localStorage.getItem("scCurrentUser"));
    var course = document.getElementById("materialCourseSelect").value;
    if (!user || !course) return;

    var results = getTestResults().filter(function(r) {
        return r.username === user.username && r.course === course;
    });

    var list = document.getElementById("testHistoryList");
    list.innerHTML = "";

    if (results.length === 0) {
        list.innerHTML = "<li style='justify-content:center; color:#6b7280;'>No test attempts yet.</li>";
        return;
    }

    results.slice().reverse().forEach(function(r) {
        var item = document.createElement("li");
        item.innerHTML =
            "<span>" + r.date + "</span>" +
            "<span class='history-score' style='color:" + (r.passed ? "#2e9e5b" : "#d64545") + ";'>" +
            r.score + "/" + r.total + " (" + r.percent + "%)</span>";
        list.appendChild(item);
    });
}

function getStudents() {
    return JSON.parse(localStorage.getItem("scStudents")) || [];
}
function saveStudents(list) {
    localStorage.setItem("scStudents", JSON.stringify(list));
}

function addStudent(e) {
    e.preventDefault();
    var name = document.getElementById("stuName").value;
    var roll = document.getElementById("stuRoll").value;
    var course = document.getElementById("stuCourse").value;
    var email = document.getElementById("stuEmail").value;

    if (!name || !roll) {
        alert("Please enter Name and Roll Number.");
        return;
    }

    var students = getStudents();
    students.push({ id: Date.now(), name: name, roll: roll, course: course, email: email });
    saveStudents(students);

    document.getElementById("stuName").value = "";
    document.getElementById("stuRoll").value = "";
    document.getElementById("stuCourse").value = "";
    document.getElementById("stuEmail").value = "";

    renderStudents();
}

function deleteStudent(id) {
    if (!confirm("Delete this student?")) return;
    var students = getStudents().filter(function(s) { return s.id !== id; });
    saveStudents(students);
    renderStudents();
}

function renderStudents() {
    var students = getStudents();
    var search = document.getElementById("searchInput").value.toLowerCase();
    var filtered = students.filter(function(s) {
        return s.name.toLowerCase().includes(search) || s.roll.toLowerCase().includes(search);
    });

    var body = document.getElementById("studentTableBody");
    body.innerHTML = "";

    filtered.forEach(function(s) {
        var row = document.createElement("tr");
        row.innerHTML =
            "<td data-label='Name'>" + s.name + "</td>" +
            "<td data-label='Roll No.'>" + s.roll + "</td>" +
            "<td data-label='Course'>" + (s.course || "-") + "</td>" +
            "<td data-label='Email'>" + (s.email || "-") + "</td>" +
            "<td data-label='Action'><button class='btn-del' onclick='deleteStudent(" + s.id + ")'>Delete</button></td>";
        body.appendChild(row);
    });
}
