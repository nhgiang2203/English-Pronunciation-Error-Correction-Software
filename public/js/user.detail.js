function editAvatar() {
  document.getElementById('avatarInput').style.display = 'block';
  document.getElementById('saveAvatarBtn').style.display = 'inline-block';
}

function editField(field) {
  document.getElementById(`${field}Text`).style.display = 'none';
  document.getElementById(`${field}Input`).style.display = 'block';
  document.getElementById(`save${capitalize(field)}Btn`).style.display = 'inline-block';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
