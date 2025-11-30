
function inviteCodeGenerator() {
    return Math.floor(100000 + Math.random() * 900000)
}

console.log(inviteCodeGenerator());