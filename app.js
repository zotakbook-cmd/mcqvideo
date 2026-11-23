(() => {
'use strict';
const $ = id => document.getElementById(id);
const state = { questions: [], index: 0, stage: 0, audioUrls: {question:null,answer:null,explanation:null}, presentationMode:false };
const audio = $('audioPlayer');
let toastTimer;

function notify(message) {
  const el=$('toast'); el.textContent=message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2400);
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function parseQuestions(raw) {
  const blocks=raw.replace(/^\uFEFF/,'').split(/^\s*#\s*/m).map(s=>s.trim()).filter(Boolean);
  const parsed=[];
  for(let i=0;i+2<blocks.length;i+=3) {
    const questionBlock=blocks[i];
    const answerBlock=blocks[i+1];
    const explanation=blocks[i+2];
    const lines=questionBlock.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const optionLines=lines.filter(line=>/^[A-Da-d][.)、:：-]\s*/.test(line));
    const questionLines=lines.filter(line=>!/^[A-Da-d][.)、:：-]\s*/.test(line));
    const options=optionLines.map(line=>{
      const match=line.match(/^([A-Da-d])[.)、:：-]\s*(.*)$/);
      return {key:match[1].toUpperCase(),text:match[2]};
    });
    const answerMatch=answerBlock.match(/(?:^|\s)([A-Da-d])(?:\s|$|[.)、])/);
    const answer=answerMatch?answerMatch[1].toUpperCase():answerBlock.trim().replace(/[^A-Da-d]/g,'').slice(0,1).toUpperCase();
    if(questionLines.length && options.length && /^[A-D]$/.test(answer)) parsed.push({question:questionLines.join('\n'),options,answer,explanation});
  }
  return parsed;
}
function loadQuestions(raw) {
  const parsed=parseQuestions(raw);
  if(!parsed.length) { notify('Format नहीं मिला। प्रत्येक प्रश्न के बाद # Answer और # Explanation रखें।'); return; }
  state.questions=parsed; state.index=0; state.stage=0;
  $('questionCount').textContent=parsed.length+' QUESTIONS';
  $('transportTitle').textContent='Question set loaded';
  $('transportSub').textContent=parsed.length+' questions • '+(parsed.length*3)+' presentation stages';
  render();
  notify(parsed.length+' questions loaded successfully');
}
function current() { return state.questions[state.index]; }
function render() {
  const q=current();
  document.querySelectorAll('.stage-tab').forEach((b,i)=>b.classList.toggle('active',i===state.stage));
  const stageNames=['QUESTION','ANSWER REVEAL','EXPLANATION'];
  $('stageLabel').textContent=stageNames[state.stage];
  $('stageQuestion').textContent='QUESTION '+String(state.index+1).padStart(2,'0');
  $('canvasCounter').textContent=String(state.index+1).padStart(2,'0')+' / '+String(state.questions.length||1).padStart(2,'0');
  if(!q) return;
  const content=$('canvasContent');
  if(state.stage===2) {
    content.innerHTML='<div class="question-kicker">✦ EXPLANATION</div><div class="explanation-text">'+escapeHTML(q.explanation)+'</div>';
    $('transportTitle').textContent='Explanation';
  } else {
    let html='<div class="question-kicker">QUESTION '+String(state.index+1).padStart(2,'0')+'</div><div class="question-text">'+escapeHTML(q.question)+'</div><div class="options-grid">';
    for(const option of q.options) {
      const correct=state.stage===1&&option.key===q.answer;
      html+='<div class="option '+(correct?'correct':'')+'"><span class="option-letter">'+option.key+'</span><span>'+escapeHTML(option.text)+'</span></div>';
    }
    html+='</div>';
    if(state.stage===1) html='<div class="answer-banner"><span class="answer-check">✓</span> सही उत्तर</div>'+html;
    content.innerHTML=html;
    $('transportTitle').textContent=state.stage===0?'Question & Options':'Correct Answer: '+q.answer;
  }
  $('transportSub').textContent='Question '+(state.index+1)+' of '+state.questions.length+' • Stage '+(state.stage+1)+' of 3';
  stopAudio();
  const audioKey=['question','answer','explanation'][state.stage];
  const url=state.audioUrls[audioKey];
  if(url) {
    audio.src=url;
    if($('autoplay').checked) audio.play().then(updatePlayButton).catch(()=>notify('Audio playback शुरू करने के लिए Play दबाएँ'));
  } else {
    audio.removeAttribute('src'); audio.load(); updateAudioUI();
  }
  $('seekBar').value=0; $('timeDisplay').textContent='00:00 / 00:00';
  $('playBtn').textContent='▶';
  $('presentation').classList.remove('stage-enter');
  void $('presentation').offsetWidth;
  $('presentation').classList.add('stage-enter');
}
function stopAudio() { audio.pause(); audio.currentTime=0; }
function updatePlayButton(){ $('playBtn').textContent=audio.paused?'▶':'Ⅱ'; }
function updateAudioUI() {
  const duration=Number.isFinite(audio.duration)?audio.duration:0;
  $('timeDisplay').textContent=formatTime(audio.currentTime)+' / '+formatTime(duration);
  $('seekBar').max=duration||100;
  $('seekBar').value=duration?audio.currentTime:0;
  updatePlayButton();
}
function formatTime(seconds){if(!Number.isFinite(seconds))return '00:00';return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(Math.floor(seconds%60)).padStart(2,'0');}
function go(delta) {
  if(!state.questions.length) return;
  const absolute=state.index*3+state.stage+delta;
  const total=state.questions.length*3;
  if(absolute<0||absolute>=total) return;
  state.index=Math.floor(absolute/3); state.stage=absolute%3; render();
}
function toggleFullscreen() {
  if(!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(()=>notify('Fullscreen उपलब्ध नहीं है'));
  else document.exitFullscreen?.();
}
function togglePresentation() {
  state.presentationMode=!state.presentationMode;
  document.body.classList.toggle('presentation-mode',state.presentationMode);
  if(state.presentationMode && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(()=>{});
  if(!state.presentationMode && document.fullscreenElement) document.exitFullscreen?.();
}

$('loadBtn').addEventListener('click',()=>loadQuestions($('questionInput').value));
$('textFile').addEventListener('change',async e=>{
  const file=e.target.files?.[0]; if(!file)return;
  const text=await file.text(); $('questionInput').value=text; loadQuestions(text);
});
[['qAudio','question','qAudioName'],['aAudio','answer','aAudioName'],['eAudio','explanation','eAudioName']].forEach(([input,key,label])=>{
  $(input).addEventListener('change',e=>{
    const file=e.target.files?.[0]; if(!file)return;
    if(state.audioUrls[key]) URL.revokeObjectURL(state.audioUrls[key]);
    state.audioUrls[key]=URL.createObjectURL(file);
    $(label).textContent=file.name;
    notify(file.name+' attached');
    if(state.questions.length) render();
  });
});
$('prevBtn').addEventListener('click',()=>go(-1)); $('nextBtn').addEventListener('click',()=>go(1));
$('prevZone').addEventListener('click',()=>go(-1)); $('nextZone').addEventListener('click',()=>go(1));
document.querySelectorAll('.stage-tab').forEach(button=>button.addEventListener('click',()=>{
  if(!state.questions.length)return;
  state.stage=Number(button.dataset.stage); render();
}));
$('playBtn').addEventListener('click',()=>{
  if(!audio.src){notify('इस stage के लिए audio file attach करें');return;}
  if(audio.paused) audio.play().then(updatePlayButton).catch(()=>notify('Audio play नहीं हो सका'));
  else audio.pause();
  updatePlayButton();
});
$('fullscreenBtn').addEventListener('click',toggleFullscreen);
$('openPresentation').addEventListener('click',togglePresentation);
audio.addEventListener('timeupdate',updateAudioUI);
audio.addEventListener('loadedmetadata',updateAudioUI);
audio.addEventListener('play',updatePlayButton);
audio.addEventListener('pause',updatePlayButton);
audio.addEventListener('ended',()=>{updatePlayButton();notify('Audio complete — Next से आगे बढ़ें');});
$('seekBar').addEventListener('input',e=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(e.target.value);});
document.addEventListener('keydown',e=>{
  const tag=document.activeElement?.tagName;
  if(tag==='TEXTAREA'||tag==='INPUT')return;
  if(e.key==='ArrowRight'){e.preventDefault();go(1);}
  if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}
  if(e.code==='Space'){e.preventDefault();$('playBtn').click();}
  if(e.key.toLowerCase()==='f')toggleFullscreen();
  if(e.key==='Escape'&&state.presentationMode){state.presentationMode=false;document.body.classList.remove('presentation-mode');}
});
const sample='# भारत का संविधान कब लागू हुआ?\nA. 15 अगस्त 1947\nB. 26 जनवरी 1950\nC. 26 नवंबर 1949\nD. 2 अक्टूबर 1950\n\n# B\n\n# भारतीय संविधान 26 नवंबर 1949 को अंगीकृत किया गया था, लेकिन इसे 26 जनवरी 1950 को लागू किया गया।';
$('questionInput').value=sample;
loadQuestions(sample);
})();