
function validateFileName(fileName ){
	//var fileName = 'a.html';
	var reg = new RegExp('[\\\\/:*?\"<>|]');
	if (reg.test(fileName)) {
	    //"上传的文件名不能包含【\\\\/:*?\"<>|】这些非法字符,请修改后重新上传!";
	    return false;
	}
	return true;
}
function randomString(e) {    
    e = e || 32;
    var t = "123456789",
    a = t.length,
    n = "";
    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}

const { createApp } = Vue


last_text = "";

app = createApp({
    data() {
        return {
            // 用于显示
            script_name:"名字",
            script_description:"介绍",
            script_keyword:"关键词",
            script_ppfs:"匹配方式",
            script_cffs:"触发方式",
            select_name_index: -1,
            // 用于记录所有数据
            codes: "正在加载内容...",
            pkg_codes : {"默认包":[]},
            select_pkg_name:"默认包",
            version:"",
            new_pkg_name:"",
            rename_pkg_name:"",
            rename_pkg_process:[],
            can_emit_select:true,
            composing:false
        }
    },
    mounted () {

        // 对复制进行hook，解决复制时多余的换行
        ele = document.getElementById("script_content")
        ele.oncopy = (e) => {
            quill = this.$refs.child.getQuill()
            range = quill.getSelection()
            e.clipboardData.setData('text/plain', quill.getText(range.index, range.length));
            e.preventDefault();
        }
        
        // 处理中文输入
        ele.addEventListener('compositionstart',(e) =>{
            this.composing = true
            console.log('compositionstart')
        })
        ele.addEventListener('compositionend',(e) =>{    
            this.composing = false
            console.log('compositionend')
            this.highlight()
        })

        quill = this.$refs.child.getQuill()
        quill.on('text-change', (delta, oldDelta, source) => {
            if (source == 'user') {
                if(!this.composing){
                    this.highlight()
                }
            }
        });

        axios
        .get("/get_version")
        .then(
        res => {
            this.version = res.data["data"];
        })
        .catch(function (error) {
            console.log(error);
        });
        axios
        .get("/get_all_pkg_name")
        .then(
        res => {
            let ret = res.data["data"];
            // console.log(ret)
            this.pkg_codes["默认包"] = []
            for(let i = 0;i < ret.length;++i) {
                this.pkg_codes[ret[i]] = []
            }
            axios
            .get("/get_code")
            .then(
            res => {
                this.codes = res.data["data"]
                for(let i = 0;i < this.codes.length;++i) {
                    let pkg_name = this.codes[i]["pkg_name"]
                    if(pkg_name == undefined) {
                        pkg_name = "默认包"
                    }
                    if(this.pkg_codes[pkg_name] == undefined) {
                        this.pkg_codes[pkg_name] = []
                    }
                    this.pkg_codes[pkg_name].push(this.codes[i])
                }
                // console.log(this.pkg_codes)
            })
            .catch(function (error) {
                console.log(error);
            });
        })
        .catch(function (error) {
            console.log(error);
        });
        
    },
    methods: {
        select_name_index_change(new_select) {
            // 切换新数据
            if(new_select != -1){
                this.script_name = this.pkg_codes[this.select_pkg_name][new_select]["name"]
                this.script_description = this.pkg_codes[this.select_pkg_name][new_select]["description"]
                this.script_keyword = this.pkg_codes[this.select_pkg_name][new_select]["content"]["关键词"]
                this.script_ppfs = this.pkg_codes[this.select_pkg_name][new_select]["content"]["匹配方式"]
                this.script_cffs = this.pkg_codes[this.select_pkg_name][new_select]["content"]["触发方式"]
                this.$refs.child.setText(this.pkg_codes[this.select_pkg_name][new_select]["content"]["code"])
                this.highlight()
            }else{
                this.script_name = ""
                this.script_description = ""
                this.script_keyword = ""
                this.script_ppfs = ""
                this.script_cffs = ""
                this.$refs.child.setText("")
            }
        },
        // 缓存旧数据
        save_cache(old_select) {
            if(old_select != -1){
                this.pkg_codes[this.select_pkg_name][old_select]["pkg_name"] = this.select_pkg_name;
                this.pkg_codes[this.select_pkg_name][old_select]["name"] = this.script_name;
                this.pkg_codes[this.select_pkg_name][old_select]["description"] = this.script_description;
                this.pkg_codes[this.select_pkg_name][old_select]["content"]["关键词"] = this.script_keyword;
                this.pkg_codes[this.select_pkg_name][old_select]["content"]["匹配方式"] = this.script_ppfs;
                this.pkg_codes[this.select_pkg_name][old_select]["content"]["触发方式"] = this.script_cffs;
                let k = this.$refs.child.getText();
                this.pkg_codes[this.select_pkg_name][old_select]["content"]["code"] = k;
            }
        },
        save_code() {
            this.save_cache(this.select_name_index);
            let code = []

            code.push(this.rename_pkg_process)

            let keys = []
            for(let k in this.pkg_codes) {
                if(k != "默认包") {
                    keys.push(k);
                }
            }
            code.push(keys)

            
            
            for(let k in this.pkg_codes) {
                
                if(k == "默认包"){
                    for(let it in this.pkg_codes[k])
                    {
                        let kk = JSON.parse(JSON.stringify(this.pkg_codes[k][it]))
                        delete kk["pkg_name"]
                        code.push(kk)
                    }
                }else
                {
                    for(let it in this.pkg_codes[k])
                    {
                        code.push(this.pkg_codes[k][it])
                    }
                }
                
            }
            axios
            .post("/set_code",code)
            .then((res) => {
                if(res.data['retcode'] == 0){
                    this.rename_pkg_process = []
                    alert("保存成功")
                }else {
                    alert("保存失败")
                }
            })
            .catch(function (error) {
                console.log(error);
                alert("保存失败")
            });
            
        },
        add_code() {
            this.save_cache(this.select_name_index);
            this.pkg_codes[this.select_pkg_name].push({"pkg_name":this.select_pkg_name,"name":"code_name","description":"code_description","content":{"关键词":"222","触发方式":"群聊触发","匹配方式":"完全匹配","code":"hello"}})
            this.select_name_index = this.pkg_codes[this.select_pkg_name].length - 1;
            this.select_name_index_change(this.select_name_index)
        },
        del_code() {
            if(this.select_name_index != -1){
                this.pkg_codes[this.select_pkg_name].splice(this.select_name_index,1);
                this.select_name_index = -1
            }
        },
        help_web() {
            window.open("/docs/index.html", "_blank");
        },
        watch_log() {
            window.open("/watchlog.html", "_blank");
        },
        debug_btn() {
            window.open("/debug.html", "_blank");
        },
        quit_redreply() {
            let is_quit = confirm("是否真的要退出强大的红色问答？")
            if(is_quit){
                setTimeout(function(){
                    location.reload();
                },1000);
                axios.get("/close")
            }
        },
        connect_ob() {
            window.open("/obconnect.html", "_blank");
        },
        select_up() {
            if(this.select_name_index <= 0){
                return;
            }
            this.save_cache(this.select_name_index);
            t = this.pkg_codes[this.select_pkg_name][this.select_name_index]
            this.pkg_codes[this.select_pkg_name][this.select_name_index] = this.pkg_codes[this.select_pkg_name][this.select_name_index - 1]
            this.pkg_codes[this.select_pkg_name][this.select_name_index - 1] = t
            this.select_name_index_change(this.select_name_index - 1);
            this.select_name_index = this.select_name_index - 1
        },
        select_down() {
            if(this.select_name_index < 0){
                return;
            }
            if(this.select_name_index == this.pkg_codes[this.select_pkg_name].length - 1){
                return;
            }
            this.save_cache(this.select_name_index);
            t = this.pkg_codes[this.select_pkg_name][this.select_name_index]
            this.pkg_codes[this.select_pkg_name][this.select_name_index] = this.pkg_codes[this.select_pkg_name][this.select_name_index + 1]
            this.pkg_codes[this.select_pkg_name][this.select_name_index + 1] = t
            this.select_name_index_change(this.select_name_index + 1);
            this.select_name_index = this.select_name_index + 1
        },
        the_other(event) {
            this.new_pkg_name = "包_"+randomString(4)
            this.rename_pkg_name = this.select_pkg_name
            document.getElementById('other_dlg').showModal();
        },
        other_close(event) {
            document.getElementById('other_dlg').close();
        },
        pkg_create(event) {
            if (this.new_pkg_name == "") {
                alert("失败，包名不能为空")
            }
            else if(validateFileName(this.new_pkg_name) == false) {
                alert("失败，包名不能包含【\\\\/:*?\"<>|】这些非法字符")
            }
            else if(this.pkg_codes.hasOwnProperty(this.new_pkg_name)) {
                alert("失败，包名已经存在")
            }
            else {
                this.pkg_codes[this.new_pkg_name] = []
                this.save_cache(this.select_name_index);
                this.select_name_index_change(-1);
                this.select_name_index=-1;
                this.select_pkg_name = this.new_pkg_name
                document.getElementById('other_dlg').close()
            }  
        },
        pkg_rename(event) {
            if (this.rename_pkg_name == "") {
                alert("失败，包名不能为空")
            }
            else if (this.rename_pkg_name == this.select_pkg_name) {
                alert("失败，新旧包名一样")
            }
            else if(validateFileName(this.rename_pkg_name) == false) {
                alert("失败，包名不能包含【\\\\/:*?\"<>|】这些非法字符")
            }
            else if(this.pkg_codes.hasOwnProperty(this.rename_pkg_name)) {
                alert("失败，包名已经存在")
            }
            else if(this.select_pkg_name == "默认包") {
                alert("失败，不可以修改默认包")
            }
            else {
                this.rename_pkg_process.push([this.select_pkg_name,this.rename_pkg_name])
                this.pkg_codes[this.rename_pkg_name] = this.pkg_codes[this.select_pkg_name]
                delete this.pkg_codes[this.select_pkg_name]
                this.select_pkg_name = this.rename_pkg_name
                for(let it in this.pkg_codes[this.rename_pkg_name])
                {
                    this.pkg_codes[this.rename_pkg_name][it]['pkg_name'] = this.rename_pkg_name;
                }
                document.getElementById('other_dlg').close()
            }  
        },
        pkg_delete(event) {
            if(this.select_pkg_name == "默认包") {
                alert("失败，不可以删除默认包")
            }
            else if(this.pkg_codes.hasOwnProperty(this.select_pkg_name) == false)
            {
                alert("失败，没有这个包")
            }
            else
            {
                this.select_name_index=-1;
                delete this.pkg_codes[this.select_pkg_name]
                this.select_pkg_name = "默认包"
                document.getElementById('other_dlg').close()
            }
        },
        highlight()
        {
            var current_color = 0;
            function next_color(){
                current_color = (current_color + 1) % 4;
            }
            function pre_color(){
                current_color = (current_color + 3) % 4;
            }
            function make_red_value(quill,index){
                format = quill.getFormat(index,1)
                if('color' in format){
                    if(format['color'] =='red'){
                        return;
                    }
                }
                setTimeout(()=>{
                    quill.formatText(index,1, 'color','red')
                },0)
            }
            function make_black_value(quill,index){
                format = quill.getFormat(index,1)
                if('color' in format){
                    if(format['color'] =='black'){
                        return;
                    }
                }else {
                    return;
                }
                setTimeout(()=>{
                    quill.formatText(index,1, 'color','black')
                },0)
            }
            function make_blue_value(quill,index){
                format = quill.getFormat(index,1)
                if('color' in format){
                    if(format['color'] =='blue'){
                        return;
                    }
                }
                setTimeout(()=>{
                    quill.formatText(index,1, 'color','blue')
                },0)
                
            }
            function make_green_value(quill,index){
                format = quill.getFormat(index,1)
                if('color' in format){
                    if(format['color'] =='green'){
                        return;
                    }
                }
                setTimeout(()=>{
                    quill.formatText(index,1, 'color','green')
                },0)
                
            }
            var colorList = [make_black_value,make_red_value,make_blue_value,make_green_value]
            function out_text(quill,index){
                colorList[current_color](quill,index)
            }

            quill = this.$refs.child.getQuill();

            let code = quill.getText();
            for(let i = 0;i<code.length;i++){
                if(code[i] == "【"){
                    next_color()
                    out_text(quill,i)
                }
                else if(code[i] == "】"){
                    out_text(quill,i)
                    pre_color()
                }
                else if(code[i] == "\\"){
                    out_text(quill,i)
                    i += 1
                    out_text(quill,i)
                }
                else{
                    out_text(quill,i)
                }
            }
        },
    }
})
const globalOptions = {
    modules: {
      toolbar: ""
    },
    placeholder: '脚本内容',
    theme: 'snow'
}
VueQuill.QuillEditor.props.globalOptions.default = () => globalOptions
app.component('QuillEditor', VueQuill.QuillEditor);
app.mount('#app')