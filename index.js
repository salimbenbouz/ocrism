Vue.use(BootstrapVue);

Vue.component('cdn-pr-form', {
    name: 'CdnPrForm',
    props: [
    'table_id',
    'api_key'
    ],
    data: function() {
        return {
            anchors: [],
            showLoader: false,
            storedFormData: [],
            formMessage : '',
            ignored : ['SKU'],
            selectTypes: ['select', 'link_row'],
            showPrice : false,
            formResult: [],
            form: {
                elements: [{
                    label: 'Label',
                    type: 'select',
                    disabled: false,
                    value: [{
                        text: 'Choice 01',
                        value: 'choice-01'
                    }, {
                        text: 'Choice 02',
                        value: 'choice-02'
                    }]
                }]
            },
            fieldsUrl: 'https://api.reprocdn.com/api/database/fields/table/' + this.table_id,
            rowsUrl: 'https://api.reprocdn.com/api/database/rows/table/' + this.table_id + '/?user_field_names=true',
            baseUrl: 'https://api.reprocdn.com/api/database/rows/table/',
            fieldsResult: [],
            rowsResult: [],
            product : {},
            show: true
        }
    },
    created: async function() {

     await this.getFieldsDataFromApi();
     await this.getRowsDataFromApi();
     this.anchors = []
     this.selectSKU(this.rowsResult[0]);
     this.fetchPriceDifferences()
 },
 methods: {
    selectSKU(obj){
        if(obj != null){
            this.formMessage = ''
                //foreach element in the form
                for(form_el of this.form.elements){
                    //enable input
                    form_el.disabled = false
                    form_el.value = form_el.value.filter((e) => {return e.value != undefined})
                    //incase there is one possibility disabled input
                    if(form_el.value.length == 1){
                        form_el.disabled = true
                    }
                    //all inputs besides the touched ones
                    if(this.anchors.indexOf(form_el.label) == -1){
                        //if the obj column is multiple select    
                        if(Array.isArray(obj[form_el.label])){
                            this.form.elements[this.form.elements.map((e) => { return e.label}).indexOf(form_el.label)].choice =
                            obj[form_el.label][0].value
                        }else{
                           this.form.elements[this.form.elements.map((e) => { return e.label}).indexOf(form_el.label)].choice =
                           obj[form_el.label].value
                       }

                       

                        //if column is part of form calculate the rest of possibilities
                        if(!this.ignored.includes(form_el.label)){
                           this.calcPossibilities(form_el.label)
                       }
                       
                   }

               }
                //after filling all inputs form the data to get price
                let tempFormData = []
                for(let column of Object.keys(obj)){
                    if(typeof obj[column] == 'object'){
                        if(Array.isArray(obj[column])){
                          tempFormData.push({
                            id: obj.id,
                            label: column,
                            type: 'multiple_select',
                            choice: obj[column][0].value
                        })
                      }else{
                          tempFormData.push({
                            id: obj.id,
                            label: column,
                            type: 'select',
                            choice: obj[column].value
                        })
                      }
                  }
              }
                //get the price
                this.calcPrice(tempFormData)
            }

        },
        fetchPriceDifferences(){
            for(form_el of this.form.elements){
                for(let option of form_el.value){
                    option.text = option.value
                    if((parseFloat(option.price) - parseFloat(this.product.Price) ) > 0){
                        option.text = option.text+' +('+(parseFloat(option.price) - parseFloat(this.product.Price))+'$)'
                    }
                }
            }
        },
        calcPossibilities(touched){

                //Building form data with user selection
                let formData = this.form.elements.map((e)=>{return {'id':e.id,'label':e.label,'type':e.type,'choice':e.choice} }).filter((e) => { return e.choice != '' || e.choice != [] }).filter((e) => {return !this.ignored.includes(e.label)})
                let result = []

                //Registering changed input
                let changed = formData[formData.map((e) => { return e.label }).indexOf(touched)]
                
                //Building anchors from form data based on changed element
                for(let formEl of formData){
                    if(changed){

                      if(changed.id <= formEl.id){
                          this.anchors.push(formEl.label)
                      }
                      if(formEl.id > changed.id){
                        this.anchors = this.anchors.filter(e => e !== formEl.label)
                        formData = formData.filter(e => e.label !== formEl.label);
                    }


                }
            }
            //If user is going backwards in tree of form
            if(formData.length <= this.storedFormData.length){

                //Remove the remaining items from form data
                formData.splice(formData.length - 1, ((formData.length - 1) - formData.map((e)=>{ return e.label }).indexOf(touched) ))

                //Looking in ALL records since user is going backwards in the form
                for (let row of this.rowsResult) {
                    let counter = 0

                    for (let key of Object.keys(row)) {
                        for(let columnChoice of formData){
                            if(key == columnChoice.label && this.selectTypes.indexOf(columnChoice.type) != -1){
                                if(!Array.isArray(row[key]) && row[key].value == columnChoice.choice){
                                    counter += 1
                                }else if(Array.isArray(row[key])){
                                    for(let opt of row[key]){
                                        if(opt.value == columnChoice.choice){
                                            counter += 1
                                        }
                                    }
                                }
                                
                            }else if(key == columnChoice.label && columnChoice.type == 'multiple_select'){
                             if(row[key].map((e) => {return e.value}).includes(columnChoice.choice)){
                                counter += 1
                            }
                        }
                    }

                }
                if(counter == formData.length){
                        //Row is interesting
                        result.push(row)
                    }
                }

                this.formResult = result

                //If no results are found display no combinations message
                if(this.formResult.length == 0){
                    this.formMessage = "There are no combinations available for this selection";
                }

                //Emptying the form elements concerned
                //Looping on rows of result table
                for (let row of this.formResult) {
                    for (let key of Object.keys(row)) {

                                //If the row field is found in the form elements array
                                if (row[key] != undefined && this.form.elements.map((e) => { return e.label }).indexOf(key) > - 1) {
                                   if(!this.anchors.includes(key)){

                                    this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].choice = ''
                                    this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value = []
                                }
                            }
                        }
                    }

                //Filling the form elements concerned
                for (let row of this.formResult) {
                    for (let key of Object.keys(row)) {

                        //If the row field is found in the form elements array
                        if (row[key] != undefined && this.form.elements.map((e) => { return e.label }).indexOf(key) > - 1) {
                            if(!this.anchors.includes(key)){
                            //Append possibilities to value array of form element
                            if (this.selectTypes.indexOf(this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].type) != -1) {

                                this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].choice = ''

                                        if(this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.map((e) => {return e.value}).indexOf(row[key].value) == -1){
                                             if(Array.isArray(row[key]) && this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.map((e) => {return e.value}).indexOf(row[key][0].value) == -1){
                                                 this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.push({
                                                    text: row[key][0].value,
                                                    value: row[key][0].value,
                                                    price: row['Price']
                                                })
                                             }else{
                                                this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.push({
                                                    text: row[key].value,
                                                    value: row[key].value,
                                                    price: row['Price']
                                                })
                                             }
                                            
                                         }

                                 } else if (this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].type === 'multiple_select'){
                                    this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].choice = ''

                                    for(let el of row[key]){
                                      if(this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.map((e) => {return e.value}).indexOf(el.value) == -1){
                                        this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.push({'text': el.value,'value': el.value, price: row['Price']})
                                    }
                                }
                            }
                        }
                    }

                }

            }

        //Else if user is going in downwards direction of form
    }else{

                //Search only on the rows filled in the form
                for (let row of this.formResult) {
                    let counter = 0
                    for (let key of Object.keys(row)) {
                        for(let columnChoice of formData){
                            if(key == columnChoice.label && this.selectTypes.indexOf(columnChoice.type) != -1){
                                if(!Array.isArray(row[key]) && row[key].value == columnChoice.choice){
                                    counter += 1
                                }else if(Array.isArray(row[key])){
                                    for(let opt of row[key]){
                                        if(opt.value == columnChoice.choice){
                                            counter += 1
                                        }
                                    }
                                }
                            }else if(key == columnChoice.label && columnChoice.type == 'multiple_select'){
                               if(row[key].map((e) => {return e.value}).includes(columnChoice.choice)){
                                counter += 1
                            }

                        }
                    }

                }
                if(counter == formData.length){
                    result.push(row)
                }
            }

                //Filling form with result
                this.formResult = result
                this.fillPossiblities(this.formResult)
                
            }

            //If no results display combinations message
            if(result.length == 0){
                this.formMessage = "There are no combinations available for this selection";
            }

            //If user selected all available options
            if(formData.length == this.form.elements.length - 1){   

                //Calculate the price
                this.calcPrice(formData);
            }else{

                //Empty price
                this.product = {}
            }
            this.anchors = [...new Set(this.anchors)]
            
            //Store form data for next change iteration test
            this.storedFormData = formData
            console.log('Total result ==> '+result.length)
        },
        onChange(event) {
            this.showPrice = false
            this.formMessage = ""

            this.calcPossibilities(event.target.id);

            this.selectSKU(this.formResult[0]);

            this.fetchPriceDifferences();
        },
        onSubmit(event) {
            event.preventDefault()
            alert(JSON.stringify(this.form))
        },
        calcPrice(data){
            this.showLoader =true;
            this.product = {}
            let found = {};

            //Looping on filtered rows to get concerned price
            for (let row of this.formResult) {
                let rowIsIncluded = false
                for (let key of Object.keys(row)) {
                    for(let columnChoice of data){
                        if(key == columnChoice.label && this.selectTypes.indexOf(columnChoice.type) != -1){
                            if(row[key].value == columnChoice.choice){
                                rowIsIncluded = true
                            }else{
                                rowIsIncluded = false
                            }

                        }else if(key == columnChoice.label && columnChoice.type == 'multiple_select'){
                            if(row[key].map((e) => {return e.value}).includes(columnChoice.choice)){
                                rowIsIncluded = true
                            }else{
                                rowIsIncluded = false
                            }
                        }
                    }

                }
                if(rowIsIncluded){
                    found = row
                    break;
                }
            }

            this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf('SKU')].choice = found['SKU']

            //Found row
            this.product = found;
            this.showPrice = true;
            this.showLoader = false
        },
        async getTableContent(table_id){
            this.showLoader = true
            let result = []
            await axios.get(this.baseUrl+table_id+'/?user_field_names=true', {
                headers: {
                    Authorization: "Token " + this.api_key
                }
            })
            .then(response => {
                this.showLoader = false
                result = response.data.results
            })
            .catch(error => {
                this.showLoader = false
                console.log(error)
            })
            return result
        },
        async constructForm(table_data) {

            //Looping on fields of table
            for (let field of table_data) {
                //Input cases for field types
                switch (field.type) {

                        //Select
                        case "single_select":

                        //Add Select to form object
                        this.form.elements.push({
                            label: field.name,
                            type: 'select',
                            disabled: false,
                            id: field.id,
                            choice: '',
                            value: field.select_options.map((e) => {
                                return {
                                    text: e.value,
                                    value: e.value
                                }
                            })
                        })
                        break;

                         //Multi Select
                         case "multiple_select":
                        //Add Select to form object
                        this.form.elements.push({
                            label: field.name,
                            id: field.id,
                            type: 'multiple_select',
                            disabled: false,
                            choice: '',
                            value: field.select_options.map((e) => {
                                return {
                                    text: e.value,
                                    value: e.value
                                }
                            })
                        })
                        break;

                        //Link Row
                        case "link_row":
                        
                        let options = await this.getTableContent(field.link_row_table)
                        //Add Select to form object
                        this.form.elements.push({
                            label: field.name,
                            type: 'select',
                            disabled: false,
                            id: field.id,
                            choice: '',
                            value: options.map((e) => {return {id: e.id, type: e.type,text : e.Name,value:e.Name}})
                        })
                        break;

                        case "text":
                        //Adding SKU reference to form object
                        if(field.name != 'Name'){
                            this.form.elements.push({
                                label: field.name,
                                type: 'text',
                                id: field.id,
                                disabled: false,
                                choice: '',
                                value: ''
                            })
                        }
                        break;

                        //Formula
                        case "formula":
                        //Adding SKU reference to form object
                        this.form.elements.push({
                            label: "SKU",
                            type: 'text',
                            id: field.id,
                            disabled: false,
                            choice: '',
                            value: ''
                        })
                        break;
                        default:
                        break;
                    }
                }

            },
            fillPossiblities(table_data) {

             //Empty choices
             for (let row of this.formResult) {
                for (let key of Object.keys(row)) {

                                //If the row field is found in the form elements array
                                if (row[key] != undefined && this.form.elements.map((e) => { return e.label }).indexOf(key) > - 1) {
                                   if(!this.anchors.includes(key)){

                                    this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].choice = ''
                                    this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value = []
                                }
                            }
                        }
                    }
            //Looping on rows of table
            for (let row of table_data) {
                for (let key of Object.keys(row)) {

                    //If the row field is found in the form elements array
                    if (row[key] != undefined && this.form.elements.map((e) => { return e.label }).indexOf(key) > - 1) {

                        //Append possibilities to value array of form element
                        if (this.selectTypes.indexOf(this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].type) != -1) {
                           //Skip if element already exists
                           if(this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.map((e) => {return e.value}).indexOf(row[key].value) == -1){
                             if(Array.isArray(row[key]) && this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.map((e) => {return e.value}).indexOf(row[key][0].value) == -1){
                                 this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.push({
                                    text: row[key][0].value,
                                    value: row[key][0].value,
                                    price: row['Price']
                                })
                             }else{
                                this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.push({
                                    text: row[key].value,
                                    value: row[key].value,
                                    price: row['Price']
                                })
                             }
                            
                         }
                     } else if (this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].type === 'multiple_select'){
                        for(let el of row[key]){
                          if(this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.map((e) => {return e.value}).indexOf(el.value) == -1){
                            this.form.elements[this.form.elements.map((e) => { return e.label }).indexOf(key)].value.push({'text': el.value,'value': el.value, price: row['Price']})
                        }
                    }
                }

            }

        }

    }




},
async getFieldsDataFromApi() {
    this.showLoader = true
    await axios.get(this.fieldsUrl, {
        headers: {
            Authorization: "Token " + this.api_key
        }
    })
    .then(async response => {
        this.showLoader = false
        this.result = response.data
        this.form.elements = []
        await this.constructForm(this.result)
    })
    .catch(error => {
        this.showLoader = false
        console.log(error)
    })
},
async getRowsDataFromApi() {
    this.showLoader = true
    await axios.get(this.rowsUrl, {
        headers: {
            Authorization: "Token " + this.api_key
        }
    })
    .then(response => {
        this.showLoader = false
        this.rowsResult = response.data.results
        this.formResult = response.data.results

        this.fillPossiblities(this.rowsResult)
    })
    .catch(error => {
        this.showLoader = false
        console.log(error)
    })
}

},
template: `
<b-container class="pl-5 pr-5" fluid>
<b-row class="loader" v-show="showLoader">
<b-spinner class="m-auto" variant="primary" type="grow"></b-spinner>
</b-row>
<b-row>
<b-form class="mt-3" @change="onChange" @submit="onSubmit"  v-if="show">
<template v-for="(form_el, key) in form.elements">
<template v-if="form_el.type == 'select' || form_el.type == 'multiple_select'">
<b-form-group :id="'input-group-'+key" :label="form_el.label" :label-for="'input-'+key">
<select class="form-control" :id="form_el.label" v-model="form_el.choice" size="md"
required
:disabled="form_el.disabled"
>
<template v-for="label of form_el.value">
<option :value="label.value"> {{label.text}} </option>
</template>
</select>
</b-form-group>

</template>
</template>
<div class="message"> {{ formMessage }} </div>

<h4>Form Raw Data</h4>
<div v-for="el in form.elements">
<strong>{{el.label}}</strong> : {{el.choice}}
</div>
<hr>
<div class="price"> <strong>Price</strong> : {{product.Price}} $ </div>
<br>
<div class="add">
<button class="add-btn snipcart-add-item"
:data-item-id="product.id"
:data-item-price="product.Price"
:data-item-name="product.SKU" :disabled="!showPrice">
Add to cart
</button>
</div>
<b-alert variant="success" :show="showPrice" >
{{ product }}
</b-alert>

</b-form>
</b-row>
</b-container>
`
})
var app = new Vue({
    el: '#app'
})