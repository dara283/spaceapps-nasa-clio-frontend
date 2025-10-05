const PREFIX = 'saved_searches_'
const key = (email) => PREFIX + email
export function getSaved(email){
  return JSON.parse(localStorage.getItem(key(email)) || '[]')
}
export function saveItem(email, item){
  const list = getSaved(email)
  const id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now())
  list.unshift({ id, createdAt: new Date().toISOString(), ...item })
  localStorage.setItem(key(email), JSON.stringify(list))
  return id
}
export function deleteItem(email, id){
  const list = getSaved(email).filter(x => x.id !== id)
  localStorage.setItem(key(email), JSON.stringify(list))
}
