const appendProject = project => {
  $("table tbody").append(`
    <tr>
      <td>${project.name}</td>
      <td>${project.description}</td>
      <td>${project.creationDate}</td>
    </tr>
  `);
}

//Get a cookie by name
const getCookie = (cname) => {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

//Delete a cookie by name
const deleteCookie = (cname) => {
  document.cookie = cname + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// cargar los proyectos
const loadProjects = () => {
  $.ajax({
    url: "/projects"
  }).done(projects => {
    projects.forEach(project => appendProject(project));
  }).fail(err => {
    // si es un err.status 401 mostar el formulario de login
    console.log("Error", err)
  });
}

//On Document Ready
$(document).ready(() => {
  $("#register").hide();
  if (getCookie("express:sess").length == 0) {
    $("#login").show();
    $("#projects").hide();

  } else {
    $("#login").hide();
    $("#projects").show();
    $("tbody").html("");
    loadProjects();
  }
})

//Logout
$(".logout").on("click", () => {
  deleteCookie("express:sess");
  deleteCookie("express:sess.sig");
  $("#login").show();
  $("#projects").hide();
})

//Open Registration
$(".show-register").on("click", () => {
  $("#register").show();
  $("#login").hide();
})

//Open Login
$(".show-login").on("click", () => {
  $("#login").show();
  $("#register").hide();
})

//Register User Submit
$(".register").on("submit", e => {
  e.preventDefault();

  // limpiar los errores
  $("span.error").remove();

  const email = $(".register #email").val();
  const password = $(".register #password").val();

  $.ajax({
    method: "POST",
    url: "/register",
    contentType: "application/json",
    data: JSON.stringify({ email, password })
  }).done(() => {
    $("#login").show();
    $("#register").hide();
    $(".register #email").val("");
    $(".register #password").val("");
  }).fail(err => {
    if (err.status === 422) {
      const errors = err.responseJSON.errors;
      if (errors.email) {
        $(`<span class="error">${errors.email.message}</span>`).insertAfter(".register #email");
      }
      if (errors.password) {
        $(`<span class="error">${errors.password.message}</span>`).insertAfter(".register #password");
      }
    } else {
      console.log("Error: ", err);
    }
  });
});

//Login Submit
$(".login").on("submit", e => {
  e.preventDefault();

  // limpiar los errores
  $("span.error").remove();

  const email = $(".login #email").val();
  const password = $(".login #password").val();

  $.ajax({
    method: "POST",
    url: "/login",
    contentType: "application/json",
    data: JSON.stringify({ email, password })
  }).done(login => {
    appendProject(login);
    $("#login").hide();
    $("#projects").show();
    $("tbody").html("");
    loadProjects();
    $(".login #email").val("");
    $(".login #password").val("");
  }).fail(err => {
    if (err.status === 422) {
      const errors = err.responseJSON.errors;
      if (errors.email) {
        $(`<span class="error">${errors.email.message}</span>`).insertAfter(".login #email");
      }
      if (errors.password) {
        $(`<span class="error">${errors.password.message}</span>`).insertAfter(".login #password");
      }
    } else if (err.status === 401) {
      alert(err.responseJSON.error)
    } else {
      console.log("Error: ", err);
    }
  });
});

//Project Submit
$(".projects").on("submit", e => {
  e.preventDefault();

  // limpiar los errores
  $("span.error").remove();

  const name = $(".projects #name").val();
  const description = $(".projects #description").val();

  $.ajax({
    method: "POST",
    url: "/projects",
    contentType: "application/json",
    data: JSON.stringify({ name, description })
  }).done(project => {
    appendProject(project);

    $("#name").val("");
    $("#description").val("");
  }).fail(err => {
    if (err.status === 422) {
      const errors = err.responseJSON.errors;
      if (errors.name) {
        $(`<span class="error">${errors.name.message}</span>`).insertAfter(".projects #name");
      }
    } else {
      console.log("Error: ", err);
    }
  });
});
