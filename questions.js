const topicButtons = document.querySelectorAll('[data-filter]');
const questionItems = document.querySelectorAll('.faq-item');
topicButtons.forEach(button => button.addEventListener('click', () => {
 const topic = button.dataset.filter;
 let count = 0;
 topicButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
 questionItems.forEach(item => {
  item.hidden = topic !== 'all' && item.dataset.topic !== topic;
  if (!item.hidden) count++;
 });
 document.querySelector('#faq-count').textContent = count + ' questions';
}));

const questionForm = document.querySelector('#atlas-question-form');
const questionResult = document.querySelector('#atlas-question-result');
const questionEmail = document.querySelector('#atlas-question-email');
const questionEmailEnabled = ['email','live'].includes(window.LEADCO_CONFIG?.mode);
if (questionEmailEnabled) document.querySelector('#atlas-question-notice').textContent = 'Review your question, then send it from your email app. Nothing is sent automatically.';
questionForm.addEventListener('input', () => {
 questionResult.hidden = true;
 questionEmail.hidden = true;
 questionEmail.removeAttribute('href');
});
questionForm.addEventListener('submit', event => {
 event.preventDefault();
 for (const field of [questionForm.elements.name, questionForm.elements.question]) {
  field.setCustomValidity(field.value.trim() ? '' : 'Please enter your ' + (field.name === 'name' ? 'name.' : 'question.'));
 }
 if (!questionForm.reportValidity()) return;
 const data = Object.fromEntries(new FormData(questionForm));
 const body = 'Name: ' + data.name.trim() + '\nBusiness email: ' + data.email.trim() + '\n\nQuestion for Atlas:\n' + data.question.trim();
 document.querySelector('#atlas-question-summary').textContent = body;
 if (questionEmailEnabled) {
  questionEmail.href = 'mailto:atlas@nexhavenos.com?subject=' + encodeURIComponent('Ask Atlas — business question') + '&body=' + encodeURIComponent(body);
  questionEmail.hidden = false;
 }
 questionResult.hidden = false;
 questionResult.focus();
});
questionForm.addEventListener('input', event => event.target.setCustomValidity?.(''));
