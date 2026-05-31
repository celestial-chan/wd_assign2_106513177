$(document).ready(function () {

    /* grab data from result box */
    const form = document.getElementById("recommendForm");
    const resultBox = document.getElementById("resultBox");
    const resultContent = document.getElementById("resultContent");

    /* wipe page if form resets*/
    if (form) form.reset();

    /* list of restaurants, price, diet, restricions */
    const restaurants = [
        { name: "Watami Japanese Food", diet: ["none", "halal", "vegetarian"], budget: ["low"], purpose: ["casual"] },
        { name: "Vaporetto Bar & Eatery", diet: ["none"], budget: ["high"], purpose: ["date"] },
        { name: "Gamsa Korean BBQ", diet: ["none"], budget: ["mid", "high"], purpose: ["group", "date"] },
        { name: "Banh Mi Lab", diet: ["vegetarian", "none"], budget: ["low"], purpose: ["casual"] },
        { name: "Kebabji", diet: ["halal", "none"], budget: ["low", "mid"], purpose: ["casual", "group"] },
        { name: "Nan Yang Express Hawthorn", diet: ["halal", "vegetarian", "none"], budget: ["low"], purpose: ["casual", "group"] }
    ];

    /* checks what box u tick and collects it */
    function getCheckedValues(name) {
        return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
    }

    /* check if any restaurants fit the match*/
    function matches(user, r) {
        return (
            user.diet.some(d => r.diet.includes(d)) &&
            user.budget.some(b => r.budget.includes(b)) &&
            user.purpose.some(p => r.purpose.includes(p))
        );
    }

    /* list the restaurants in the page */
    function render(list) {
        if (!resultContent || !resultBox) return;
        resultContent.innerHTML = "";

        /* creats link and bullet list */
        if (list.length === 0) {
            resultContent.innerHTML = "<p>No matching restaurants found.</p>";
        } else {
            resultContent.innerHTML = "<ul>" + list.map(r => `<li><strong>${r.name}</strong> — <a href="reservation.html?restaurant=${encodeURIComponent(r.name)}">Reserve</a></li>`).join("") + "</ul>";
        }

        /* make visible */
        resultBox.style.display = "block";
    }

    /* make sure nothing is blank */
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const user = {
                diet: getCheckedValues("diet"),
                budget: getCheckedValues("budget"),
                purpose: getCheckedValues("purpose")
            };

            if (!user.diet.length || !user.budget.length || !user.purpose.length) {
                alert("Select at least one option in each section.");
                return;
            }

            const results = restaurants.filter(r => matches(user, r));
            render(results);
        });
    }


    /* registration form validation */
    if ($("#username").length > 0) {

        /* phone digits only live */
        $("#phone").on("input", function () {
            this.value = this.value.replace(/\D/g, "");
        });

        /* password rules popup */
        $("#pwdHelpBtn").click(function (e) {
            e.preventDefault();
            $("#overlay, #popup").remove();

            let popup =
                "<div id='overlay'></div>" +
                "<div id='popup'>" +
                "<h3>Password Rules</h3>" +
                "<ul>" +
                "<li>At least 10 characters</li>" +
                "<li>At least 1 uppercase letter</li>" +
                "<li>At least 1 lowercase letter</li>" +
                "<li>At least 1 number</li>" +
                "<li>At least 1 special character</li>" +
                "</ul>" +
                "<button id='closePopup'>Close</button>" +
                "</div>";

            $("body").append(popup);
            $("#overlay, #popup").show();
            $("#closePopup, #overlay").click(function () { $("#overlay, #popup").remove(); });
        });

        /* creates popup */
        $("#regform").submit(function (e) {
            e.preventDefault();
            let errors = [];

            let username = $("#username").val().trim();
            let email = $("#email").val().trim();
            let phone = $("#phone").val().trim();
            let password = $("#password").val();
            let confirmPassword = $("#confirmPassword").val();
            let gender = $("input[name='gender']:checked").val();
            let country = $("#country").val();

            let usernamePattern = /^\w+$/;
            let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            let phonePattern = /^\d{8,15}$/;
            let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/;

            /* required checks */
            if (!username) errors.push("Username is required");
            if (!email) errors.push("Email is required");
            if (!phone) errors.push("Phone is required");
            if (!password) errors.push("Password is required");
            if (!confirmPassword) errors.push("Confirm password is required");
            if (!gender) errors.push("Gender must be selected");
            if (!country) errors.push("Country must be selected");

            /* rule validation */
            if (username && (username.length < 5 || !usernamePattern.test(username))) errors.push("Username must be at least 5 characters, letters, numbers, and underscores only");
            if (email && !emailPattern.test(email)) errors.push("Email format is invalid");
            if (phone && !phonePattern.test(phone)) errors.push("Phone must be 8–15 digits only");
            if (password && !passwordPattern.test(password)) errors.push("Password does not meet requirements");
            if (password !== confirmPassword) errors.push("Passwords do not match");

            $("#overlay, #popup").remove();

            /* if there are errors, show them in a popup */
            if (errors.length > 0) {
                let html = "<div id='overlay'></div><div id='popup'><h3>Fix the following errors</h3><ul>";
                errors.forEach(err => { html += "<li>" + err + "</li>"; });
                html += "</ul><button id='closeError'>Close</button></div>";
                $("body").append(html);
                $("#overlay, #popup").show();
                $("#closeError, #overlay").click(function () { $("#overlay, #popup").remove(); });
                return;
            }

            /* if no errors, show success message */
            let success = "<div id='overlay'></div><div id='popup'><h3>Account Created</h3><p>Your account has been registered.</p><button id='closeSuccess'>Close</button></div>";
            $("body").append(success);
            $("#overlay, #popup").show();
            $("#closeSuccess, #overlay").click(function () { $("#overlay, #popup").remove(); });
            this.reset();
        });
    }


    /* reservation form */
    if ($("#fullname").length > 0) {

        /* set min date to today */
        const today = new Date().toISOString().split("T")[0];
        $("#resdate").attr("min", today);

        /* only numbers */
        $("#phone").on("input", function () { this.value = this.value.replace(/\D/g, ""); });
        $("#cardnumber").on("input", function () { this.value = this.value.replace(/\D/g, ""); });
        $("#vouchercode").on("input", function () { this.value = this.value.replace(/\D/g, ""); });

        /* pre fill data, had to google this */
        const params = new URLSearchParams(window.location.search);
        const restaurantParam = params.get("restaurant");
        if (restaurantParam) {
            $("#restaurant option").each(function () {
                if ($(this).val() === restaurantParam) $(this).prop("selected", true);
            });
        }

        /* deposit amounts per restaurant */
        const deposits = {
            "Watami Japanese Food": 0,
            "Vaporetto Bar and Eatery": 0,
            "Gamsa Korean BBQ": 0,
            "Banh Mi Lab": 0,
            "Kebabji": 0,
            "Nan Yang Express Hawthorn": 0
        };

        /* update deposit display when restaurant changes, doesn't matter if its all zero */
        $("#restaurant").on("change", function () {
            const amount = deposits[$(this).val()] || 0;
            $("#depositDisplay").html("<strong>$" + amount + "</strong>");
        });

        /* show/hide voucher or card fields based on what was picked */
        $("#paymethod").on("change", function () {
            const val = $(this).val();
            if (val === "voucher") {
                $("#voucherSection").show();
                $("#cardSection").hide();
            } else if (val === "online") {
                $("#cardSection").show();
                $("#voucherSection").hide();
            } else {
                $("#voucherSection, #cardSection").hide();
            }
        });

        /* same as email checkbox */
        $("#sameemail").on("change", function () {
            if ($(this).is(":checked")) {
                $("#billingemail").val($("#email").val()).prop("readonly", true);
            } else {
                $("#billingemail").val("").prop("readonly", false);
            }
        });

        /* form validation */
        $("#regform").submit(function (e) {
            e.preventDefault();
            let errors = [];

            const fullname = $("#fullname").val().trim();
            const email = $("#email").val().trim();
            const phone = $("#phone").val().trim();
            const restaurant = $("#restaurant").val();
            const resdate = $("#resdate").val();
            const restime = $("#restime").val();
            const people = $("#people").val();
            const paymethod = $("#paymethod").val();
            const billingemail = $("#billingemail").val().trim();

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phonePattern = /^\d{10,}$/;

            /* required checks */
            if (!fullname) errors.push("Full name is required");
            if (!email) errors.push("Email is required");
            if (!phone) errors.push("Phone is required");
            if (!restaurant) errors.push("Please select a restaurant");
            if (!resdate) errors.push("Date is required");
            if (!restime) errors.push("Time is required");
            if (!people || parseInt(people) < 1) errors.push("Number of people must be greater than 0");
            if (!paymethod) errors.push("Payment method is required");
            if (!billingemail) errors.push("Billing email is required");

            /* rule validation */
            if (email && !emailPattern.test(email)) errors.push("Email format is invalid");
            if (phone && !phonePattern.test(phone)) errors.push("Phone must be at least 10 digits");
            if (resdate && resdate < today) errors.push("Reservation date cannot be in the past");
            if (billingemail && !emailPattern.test(billingemail)) errors.push("Billing email format is invalid");

            /* payment validation */
            if (paymethod === "voucher") {
                const voucher = $("#vouchercode").val().trim();
                if (!voucher || voucher.length !== 12) errors.push("Voucher code must be exactly 12 digits");
            }
            if (paymethod === "online") {
                const cardtype = $("#cardtype").val();
                const cardnumber = $("#cardnumber").val().trim();
                if (!cardtype) errors.push("Please select a card type");
                if (!cardnumber) {
                    errors.push("Card number is required");
                } else if (cardtype === "amex" && !/^\d{15}$/.test(cardnumber)) {
                    errors.push("Amex card number must be 15 digits");
                } else if ((cardtype === "visa" || cardtype === "mastercard") && !/^\d{16}$/.test(cardnumber)) {
                    errors.push("Visa/Mastercard number must be 16 digits");
                }
            }

            $("#overlay, #popup").remove();

            if (errors.length > 0) {
                let html = "<div id='overlay'></div><div id='popup'><h3>Fix the following errors</h3><ul>";
                errors.forEach(err => { html += "<li>" + err + "</li>"; });
                html += "</ul><button id='closeError'>Close</button></div>";
                $("body").append(html);
                $("#overlay, #popup").show();
                $("#closeError, #overlay").click(function () { $("#overlay, #popup").remove(); });
                return;
            }

            let success = "<div id='overlay'></div><div id='popup'><h3>Reservation Confirmed</h3><p>Your reservation has been submitted.</p><button id='closeSuccess'>Close</button></div>";
            $("body").append(success);
            $("#overlay, #popup").show();
            $("#closeSuccess, #overlay").click(function () { $("#overlay, #popup").remove(); });
            this.reset();
            $("#voucherSection, #cardSection").hide();
            $("#depositDisplay").html("<strong>$0</strong>");
            $("#billingemail").prop("readonly", false);
        });
    }


    /* bill calculator */
    if ($("#groupsize").length > 0) {

        /* real average cost */
        const avgCosts = {
            "Watami Japanese Food": 18,
            "Vaporetto Bar and Eatery": 42,
            "Gamsa Korean BBQ": 40,
            "Banh Mi Lab": 14,
            "Kebabji": 17,
            "Nan Yang Express Hawthorn": 10
        };

        /* update result based on change */
        $("#restaurant, #groupsize").on("change input", function () {
            const restaurant = $("#restaurant").val();
            const groupsize = parseInt($("#groupsize").val());

            if (!restaurant || !groupsize || groupsize < 1) {
                $("#billResult").hide();
                return;
            }

            const avg = avgCosts[restaurant];
            const total = avg * groupsize;

            /* print text calculations */
            $("#resName").text(restaurant);
            $("#avgCost").text("$" + avg + " per person");
            $("#groupDisplay").text(groupsize + (groupsize === 1 ? " person" : " people"));
            $("#totalDisplay").text("$" + total.toFixed(2));
            
            /* update reservation link with new link */
            $("#reserveLink").attr("href", "reservation.html?restaurant=" + encodeURIComponent(restaurant));

            $("#billResult").show();
        });
    }

});