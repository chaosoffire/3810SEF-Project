document.addEventListener("DOMContentLoaded",()=>{
    const deleteBtn = document.querySelector("#delete-btn") as HTMLInputElement|null;
    const saveBtn = document.querySelector("#save-btn") as HTMLInputElement|null;
    const updateForm = document.querySelector("#update-form") as HTMLFormElement|null;
    if(deleteBtn){
        deleteBtn.addEventListener("click",async(event)=>{
            const params = new URLSearchParams(window.location.search);
            const id = params.get("id");
            const response:Response = await fetch(`/page/delete/${id}`,{
               method:"DELETE",
               credentials:"include"
            });

            if(response.ok){
                window.alert("Delete successful");
                window.location.href = "/page/content/?state=home";
            }else{
                window.alert("Delete failed");
            }
        });
    }

    if(updateForm){
        updateForm.addEventListener("submit",async(event)=>{
            event.preventDefault();

            const formData = new FormData(updateForm);
            const data = formDataToObjectWithArrays(formData);
            console.log("data",data);

            try {

                const response:Response = await fetch(updateForm.action, {
                    method: updateForm.method,
                    headers: {
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    window.alert("Changes Saved");
                    window.location.href = "/page/content/?state=home";
                } else {
                    window.alert("Failed to Save Changes");
                }
            } catch (error) {
                window.alert("An unexpected error occurred. Please try again.");
            }
        })
    }
});

function formDataToObjectWithArrays(formData: FormData): Record<string, string | string[] | File> {
    const data: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
        if (data[key]) {            
            if (Array.isArray(data[key])) {

                data[key].push(value);
            } else {

                data[key] = [data[key], value];
            }
        } else {
            if (key === 'categories') {
                data[key] = [value];
            } else {
                data[key] = value;
            }
        }
    }

    if (!data['categories']) {
        data['categories'] = [];
    }

    return data;
}
