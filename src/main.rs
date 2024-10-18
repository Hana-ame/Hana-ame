use std::{env, fs, thread, time};
use enigo::{
    Enigo, Settings, Keyboard,
};


fn main() {
    // 获取命令行参数
    let args: Vec<String> = env::args().collect();
    let fn_name = args.get(1).map_or("input.txt", |s| s.as_str());

    let file_content = fs::read_to_string(fn_name).unwrap_or_else(|_| {
        println!("无法读取文件: {}", fn_name);
        String::new()
    });

    for i in (1..=3).rev() {
        println!("倒计时 {} 秒", i);
        thread::sleep(time::Duration::from_secs(1));
    }

    let mut agent = Enigo::new(&Settings::default()).unwrap();
    // agent.set_delay(interval);
    // write text
    match agent.text(&file_content) {
        Ok(_) => println!("文本输入成功"),
        Err(e) => println!("文本输入失败: {}", e),
    }
}

