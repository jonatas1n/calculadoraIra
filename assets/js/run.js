const modal = new bootstrap.Modal(document.getElementById('welcome'))
const modalEl = document.getElementById('welcome')

const counter = document.getElementById('ira-counter')
const icon = document.getElementById('icon')
const logo = document.getElementById('logo')

const form = document.getElementById('form-materia')

const nomeEl = document.getElementById('nome-materia')
const creditosEl = document.getElementsByName('creditos')
const mencaoEl = document.getElementsByName('mencoes')
const addMateriaBtn = document.getElementById('add-materia')

const clearAllBtn = document.getElementById('clear-all-btn')
const semestresArea = document.getElementById('semestres')
const semestrePanelView = document.getElementById('semestrePanelView')

const previsaoTpl = document.getElementById('sem-tpl')
const previsaoBtn = document.getElementById('previsao-btn')
const previsaoCreditos = document.getElementById('previsao-creditos')
const previsaoFields = document.getElementsByClassName('previsao-field')
const previsaoIra = document.getElementById('previsao-ira')
const previsaoCheck = document.getElementById('previsao-check')
const previsaoForm = document.getElementById('previsao-form')

const proximoSemestreEl = document.getElementById('proximo-semestre')
const anteriorSemestreEl = document.getElementById('anterior-semestre')

const mailBtn = document.getElementById('mail-btn')

const state = {
    semestre: 0,
    apagaDados: false,
    previsao: false,
    visitante: true,

    alteraApaga: function () {
        this.apagaDados = !this.apagaDados
    },

    position: function(it) {
        if (it == 1) {
            if (state.semestre == calculadoraIRA.semestres.length - 1) {
                calculadoraIRA.newSemestre()
            }
    
            state.semestre++
        } else if (state.semestre) {
            state.semestre--
        }

        if(state.semestre == 0){
            anteriorSemestreEl.disabled = true
        } else anteriorSemestreEl.disabled = false
    
        semestres.update()
    }
}

const semestres = {
    update: function(){
        if (calculadoraIRA.semestres.length == 0) calculadoraIRA.newSemestre()

        var semestre = calculadoraIRA.semestres[state.semestre]
        semestre.materias = semestre.materias.reverse()

        semestrePanelView.innerHTML = `${state.semestre + 1}º Semestre`
        semestresArea.innerHTML = ''

        var cookieObj = ''

        semestre.materias.forEach(el => {
            gui.materia(el)
            cookieObj += `${el.nome}|${el.creditos}|${el.mencao}|${el.id}/`
        })

        cookie.createCookie.semestre(cookieObj)
        setIRA()
    },

    clear: function() {
        let resultado = window.confirm('Você tem certeza que deseja limpar tudo?\n Você também excluirá os registros de matérias salvas na sua máquina')
        if (resultado) {
            calculadoraIRA.clear()
            cookie.createCookie.sizeSemestre(0)
            this.update()
            calculadoraIRA.calculaIRA()
        }
    }
}

const previsao = {
    createField: function(){
        var len = previsaoCreditos.children.length
        if(len <= 17){            
            var semestre = previsaoTpl.content.cloneNode(true)
            
            previsaoCreditos.appendChild(semestre)
            
            
            var label = previsaoCreditos.children[len]
            label = label.querySelector('label')
            label.innerHTML = `Sem. ${len + 1}: `
        }
    },

    calcula: function(){
        var fields = Array.prototype.slice.call(previsaoFields, 0)
        var values = fields.map(elem => elem.value)
        var ira = previsaoIra.value

        var cookieObj = values.join('|')
        cookie.createCookie.previsao(cookieObj, ira)

        calculadoraIRA.previsao(ira, values)
        semestres.update()
    },

    changeState: function(){
        previsaoForm.classList.toggle('d-none')
        previsaoBtn.classList.toggle('d-none')
        state.previsao = !state.previsao
        this.createField()

        if(!state.previsao){
            calculadoraIRA.zeraPrevisao()
            previsaoCreditos.innerHTML = ''
            previsaoIra.value = null
            previsaoCheck.checked = false

            cookie.createCookie.notPrevisao()
        }
    }
}

function setIRA() { // Função chamada para calcular o IRA e exibi-lo
    let ira = calculadoraIRA.ira()
    ira = ira.toFixed(4)
    counter.innerHTML = `<b>IRA: ${ira}</b>`

    if (ira < 5) {
        if (ira >= 3) {
            counter.classList.add('bg-sucess')
            counter.classList.remove('bg-danger')
        } else {
            counter.classList.add('bg-danger')
            counter.classList.remove('bg-sucess')
        }
        counter.classList.remove('bg-secondary')
    }
}

function addMateria(){
    var nome = nomeEl.value

    var mencao = Array.prototype.slice.call(mencaoEl, 0);
    mencao = mencao.filter(elem => elem.checked)
    mencaoVal = mencao[0].value

    var creditos = Array.prototype.slice.call(creditosEl, 0);
    creditos = creditos.filter(elem => elem.checked)
    creditosVal = parseInt(creditos[0].value)

    calculadoraIRA.addMateria(nome, creditosVal, mencaoVal, state.semestre);
    calculadoraIRA.calculaIRA();

    if (state.apaga) {
        nomeEl.value = ''
        mencao[0].checked = false
        creditos[0].checked = false
    }

    semestres.update()
}

var textarea = document.createElement('textarea')
textarea.innerHTML = 'jonatasgomesb@gmail.com'
textarea.classList.add('d-none')
document.body.appendChild(textarea)

function copyEmail(){
    console.log("works")
    textarea.select()
    document.execCommand('copy')
    var message = document.getElementById('message-email')
    message.classList.toggle('d-none')
    setTimeout(message.classList.toggle('d-none'), 1250)
}

modalEl.addEventListener('hide.bs.modal', gui.showHeader)

addMateriaBtn.addEventListener('click', addMateria)

previsaoBtn.addEventListener('click', previsao.createField)

anteriorSemestreEl.addEventListener('click', () => state.position(-1))
proximoSemestreEl.addEventListener('click', () => state.position(1))

calculadoraIRA.newSemestre()
cookie.readCookie()
calculadoraIRA.calculaIRA()
semestres.update()
state.position(0)

if(state.visitante) window.onload = modal.show()
else gui.showHeader()
