/* ----------  Email-sending module  ---------- */
(function(){
  const RECIPIENT = 'info@sweetbuns.com';   // << change to your receiving address
  const form      = document.getElementById('emailForm');
  if (!form) return;                       // only runs on pages with the form
  const msgBox    = document.getElementById('formMsg');
  const btn       = document.getElementById('submitBtn');

  /* utility */
  function show(m,isError=false){
    msgBox.textContent = m;
    msgBox.className   = isError ? 'error' : 'success';
  }
  function enc(s){ return encodeURIComponent(s||''); }

  /* client-side composers (lecturer’s method) */
  function composeMailto(to,sub,body){
    return `mailto:${enc(to)}?subject=${enc(sub)}&body=${enc(body)}`;
  }
  function composeGmail(to,sub,body){
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(to)}&su=${enc(sub)}&body=${enc(body)}`;
  }
  function composeOutlook(to,sub,body){
    return `https://outlook.office.com/mail/deeplink/compose?to=${enc(to)}&subject=${enc(sub)}&body=${enc(body)}`;
  }

  /* real send via fetch → PHP endpoint */
  async function sendViaServer(data){
    const res = await fetch('sendmail.php',{method:'POST',body:new FormData(data)});
    if (!res.ok) throw new Error('Network error');
    const txt = await res.text();
    if (txt !== 'OK') throw new Error(txt);
  }

  /* main handler */
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    show('');                     // clear old message
    if (!form.checkValidity()){   // built-in HTML5 validation
      form.reportValidity();
      return;
    }
    btn.disabled = true;

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();
    const sendVia = form.querySelector('[name="sendVia"]:checked').value;
    const formType= form.formType.value; // contact | enquiry

    const subject = `${formType} from ${name}`;
    const body = `Hello Sweet Buns team,\n\n${message}\n\nSender: ${name}\nEmail: ${email}`+
                 (formType==='enquiry' ? `\nEnquiry type: ${form.enquiryType.value}\nEvent date: ${form.eventDate.value}`:'');

    try{
      switch(sendVia){
        case 'gmail':
          window.open(composeGmail(RECIPIENT,subject,body),'_blank','noreferrer');
          show('Gmail compose window opened – review & send.',false);
          form.reset();
          break;
        case 'outlook':
          window.open(composeOutlook(RECIPIENT,subject,body),'_blank','noreferrer');
          show('Outlook compose window opened – review & send.',false);
          form.reset();
          break;
        case 'mailto':
          window.location.href = composeMailto(RECIPIENT,subject,body);
          show('Mail app opened – review & send.',false);
          form.reset();
          break;
        case 'server':
          await sendViaServer(form);
          show('Message sent successfully – we will reply within 24 hrs.',false);
          form.reset();
          break;
        default:
          throw new Error('Unknown send method');
      }
    }catch(err){
      show(err.message,true);
    }finally{
      btn.disabled = false;
    }
  });

  /* enquiry page: show/hide extra fields */
  if (form.formType.value === 'enquiry'){
    document.getElementById('enquiryExtra').style.display='block';
  }
})();