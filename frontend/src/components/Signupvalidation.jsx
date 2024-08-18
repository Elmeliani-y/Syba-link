function Validationform(values) {
  let error = {};
  const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;
  if (values.first_name === "") {
    error.first_name = "first name should not be empty";
  }  else {
    error.first_name = "";
  }
  if (values.last_name === "") {
    error.last_name = "last name should not be empty";
  }  else {
    error.last_name = "";
  }
  if (values.nickname === "") {
    error.nickname = "nickname should not be empty";
  }  else {
    error.nickname = "";
  }
    if (values.email === "") {
    error.email = "Email should not be empty";
  } else if (!email_pattern.test(values.email)) {
    error.email = "Email didn't match";
  } else {
    error.email = "";
  }
  if (values.password === "") {
    error.password = "password should not be empty";
  } else if (!password_pattern.test(values.password)) {
    error.password = "Password didn't match";
  } else {
    error.password = "";
  }
  return error;
}
export default Validationform;
