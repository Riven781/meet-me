export function formatDate(ts){
  const now = Date.now();
  const nowDate = new Date();
  const diff = now - ts;
  
  const sec = Math.floor(diff / 1000);
  if (sec < 15) return 'just now';
  if (sec < 60) return `${sec} seconds ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minutes ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hours ago`;

  const day = Math.floor(hr / 24);
  if (day === 1) return 'yesterday';
  if (day < 7) return `${day} days ago`;

  const date = new Date(ts);


  const sameYear = date.getFullYear() === nowDate.getFullYear();

  const options = {
    day: "numeric",
    month: "long",
  }

  if (!sameYear) {
    options.year = "numeric";
  }

  return new Intl.DateTimeFormat("en-GB", options).format(date);

}