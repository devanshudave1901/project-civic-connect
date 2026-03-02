let button = document.getElementById('getStarted');
let addIssueButton = document.getElementById('addIssueButton');

button.addEventListener('click', function() {
    window.location.href = '/login';
});
addIssueButton.addEventListener('click', function() {
    window.location.href = '/addIssue';
});