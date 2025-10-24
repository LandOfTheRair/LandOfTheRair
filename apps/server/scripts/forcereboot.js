fetch('http://localhost:6975/reboot/force?now=1', {
  method: 'POST',
}).catch((err) => {
  console.error(err);
});
