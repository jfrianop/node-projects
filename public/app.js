const appendProject = project => {
  $("table tbody").append(`
    <tr>
      <td>${project.name}</td>
      <td>${project.description}</td>
      <td>${project.creationDate}</td>
    </tr>
  `);
}

// cargar los proyectos
$.ajax({
  url: "/projects"
}).done(projects => {
  projects.forEach(project => appendProject(project));
}).fail(err => {
  // si es un err.status 401 mostar el formulario de login
  console.log("Error", err)
});

//
$("form").on("submit", e => {
  e.preventDefault();

  // limpiar los errores
  $("span.error").remove();

  const name = $("#name").val();
  const description = $("#description").val();

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
        $(`<span class="error">${errors.name.message}</span>`).insertAfter("#name");
      }
    } else {
      console.log("Error: ", err);
    }
  });
});
