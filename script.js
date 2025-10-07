
function getInput(){
    const task = {
        titolo: document.getElementById('titolo').value,
        descrizione: document.getElementById('descrizione').value,
        scadenza: document.getElementById('scadenza').innerText,
        priorita: document.getElementById('priorita').value
    };
    
    let lista = document.getElementById('lista')

    lista.innerHTML += `<tr>
                            <th>
                            <label>
                                <input type="checkbox" class="checkbox hidden" />
                            </label>
                            </th>
                            <td>${task.titolo}</td>
                            <td>${task.scadenza}</td>
                            <td>${task.priorita}</td>
                            </th>
                        </tr>` 
                        
}