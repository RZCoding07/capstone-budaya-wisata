document.getElementById("btnSignIn").addEventListener("click", function() {
    document.getElementById("popupSignIn").style.display = "flex";
});

document.getElementById("btnSignUp").addEventListener("click", function() {
    document.getElementById("popupSignUp").style.display = "flex";
});

function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}