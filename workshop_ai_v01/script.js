const registration = document.getElementById('registration');
const technician = document.getElementById('technician');
const jobType = document.getElementById('jobType');
const voiceNote = document.getElementById('voiceNote');
const output = document.getElementById('output');
const statusText = document.getElementById('voiceStatus');

function guessStatus(note) {
  const n = note.toLowerCase();
  if (n.includes('awaiting parts')) return 'Awaiting parts';
  if (n.includes('authorisation') || n.includes('authorization') || n.includes('approval')) return 'Awaiting customer approval';
  if (n.includes('further diagnosis') || n.includes('needs diagnosis')) return 'Further diagnosis required';
  if (n.includes('ready')) return 'Ready for collection';
  return 'To be confirmed by service manager';
}

function extractParts(note) {
  const lower = note.toLowerCase();
  const parts = [];
  const common = ['brake discs', 'brake pads', 'anti-roll bar link', 'drop link', 'tyre', 'tyres', 'battery', 'oil filter', 'air filter', 'pollen filter', 'spark plugs', 'clutch', 'alternator', 'starter motor', 'coolant', 'brake fluid'];
  common.forEach(p => { if (lower.includes(p)) parts.push('- ' + p); });
  return parts.length ? parts.join('\n') : '- Not clearly stated';
}

function buildReport() {
  const reg = registration.value.trim() || 'Registration not entered';
  const tech = technician.value.trim() || 'Technician not entered';
  const type = jobType.value;
  const note = voiceNote.value.trim();

  if (!note) {
    output.textContent = 'Please enter or record a technician note first.';
    output.classList.remove('empty');
    return;
  }

  const status = guessStatus(note);
  const parts = extractParts(note);

  const report = `PROFESSIONAL CAR AGENT - WORKSHOP AI REPORT

Registration: ${reg}
Technician: ${tech}
Job Type: ${type}

1. JOB SUMMARY
${type} job completed/assessed for vehicle ${reg}. Please review the technician note below and confirm final costing in Dragon 2000.

2. TECHNICIAN FINDINGS
${note}

3. CUSTOMER EXPLANATION
We have inspected the vehicle and recorded the technician's findings above. Any safety-related items should be explained clearly to the customer before authorisation or collection.

4. PARTS USED / REQUIRED
${parts}

5. ADVISORIES
Review the technician note for advisory items such as tyres, brakes, leaks, noises, warning lights or future maintenance.

6. JOB STATUS
${status}

7. INVOICE DESCRIPTION FOR DRAGON 2000
${note}

8. SERVICE MANAGER CHECK
☐ Parts confirmed
☐ Labour time confirmed
☐ VAT checked
☐ Customer authorised if required
☐ Dragon 2000 updated`;

  output.textContent = report;
  output.classList.remove('empty');
}

document.getElementById('generate').addEventListener('click', buildReport);
document.getElementById('copyAll').addEventListener('click', async () => {
  await navigator.clipboard.writeText(output.textContent);
  alert('Report copied. Paste into Dragon 2000.');
});

let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-GB';

  recognition.onresult = event => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    voiceNote.value = (voiceNote.value + ' ' + transcript).trim();
  };
  recognition.onstart = () => statusText.textContent = 'Listening... speak the technician note now.';
  recognition.onend = () => statusText.textContent = 'Voice recording stopped.';
}

document.getElementById('startVoice').addEventListener('click', () => {
  if (!recognition) {
    statusText.textContent = 'Voice recognition is not supported on this browser. Type the note instead.';
    return;
  }
  recognition.start();
});

document.getElementById('stopVoice').addEventListener('click', () => {
  if (recognition) recognition.stop();
});
