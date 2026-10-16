
window.cobaltBoot={started:Date.now(),ready:false};
window.addEventListener('error',function(){var el=document.getElementById('loadStage');if(el)el.textContent='Не удалось запустить 3D. Откройте сайт в браузере.';});
setTimeout(function(){if(!window.cobaltBoot.ready){var el=document.getElementById('loadDetail');if(el)el.textContent='Если экран не меняется, используйте ссылку ниже.';}},20000);
