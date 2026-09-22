const users = [
    {
        ID: "USR-101",
        name: "Karan",
        email: "karan@example.com",

        
        password: "hashed_password_karan",
        active: true,
        joined: true,
        left: false
    },
    {
        ID: "USR-102",

        name: "Kartik",
        email: "kartik@example.com",

        password: "hashed_password_kartik",
        active: true,


        joined: true,
        left: false
    },
    {
        ID: "USR-103",
        name: "Aryan",

        email: "aryan@example.com",
        password: "hashed_password_aryan",
        active: false,


        joined: false,
        left: true
    }
];

module.exports = { users };