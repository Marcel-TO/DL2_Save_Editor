#![allow(dead_code)]
#![allow(unused_variables)]
use std::io;
use std::io::prelude::*;

pub struct ConsoleLogger {
    pub log_histroy: Vec<String>,
}

pub trait LoggerFunctions {
    fn log_message(&mut self, message: &str);
    fn log_message_no_linebreak(&mut self, message: &str);
    fn log_error(&mut self, message: &str);
    fn log_break(&mut self);
    fn wait_for_input(&self);
    fn get_user_input(&self) -> String;
    fn log_title_page(&self);
}

impl LoggerFunctions for ConsoleLogger {
    fn log_message(&mut self, message: &str) {
        println!("[INFO]: {:?}", message);
        // Adding the message to the log history.
        self.log_histroy.push(message.to_string());
    }

    fn log_message_no_linebreak(&mut self, message: &str) {
        print!("{:?}", message);
    }

    fn log_error(&mut self, message: &str) {
        println!("[ERROR]: {:?}", message);
        self.log_histroy.push(message.to_string());
    }

    fn log_break(&mut self) {
        println!("");
    }

    fn wait_for_input(&self) {
        let mut stdout = io::stdout();
        stdout.write(b"Press Enter to continue...").unwrap();
        stdout.flush().unwrap();
        io::stdin().read(&mut [0]).unwrap();
    }

    fn get_user_input(&self) -> String {
        let mut stdout = io::stdout();
        stdout.write(b"[devtool]>>>").unwrap();
        stdout.flush().unwrap();

        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();
        input.trim().to_string()
    }

    fn log_title_page(&self) {
        println!(
            "
         _____                                                              _____
        ( ___ )                                                            ( ___ )
         |   |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|   |
         |   | ███████╗ █████╗ ██╗   ██╗███████╗                            |   |
         |   | ██╔════╝██╔══██╗██║   ██║██╔════╝                            |   |
         |   | ███████╗███████║██║   ██║█████╗                              |   |
         |   | ╚════██║██╔══██║╚██╗ ██╔╝██╔══╝                              |   |
         |   | ███████║██║  ██║ ╚████╔╝ ███████╗                            |   |
         |   | ╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝                            |   |
         |   | ███████╗██████╗ ██╗████████╗ ██████╗ ██████╗                 |   |
         |   | ██╔════╝██╔══██╗██║╚══██╔══╝██╔═══██╗██╔══██╗                |   |
         |   | █████╗  ██║  ██║██║   ██║   ██║   ██║██████╔╝                |   |
         |   | ██╔══╝  ██║  ██║██║   ██║   ██║   ██║██╔══██╗                |   |
         |   | ███████╗██████╔╝██║   ██║   ╚██████╔╝██║  ██║                |   |
         |   | ╚══════╝╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝                |   |
         |   | ██████╗ ███████╗██╗   ██╗████████╗ ██████╗  ██████╗ ██╗      |   |
         |   | ██╔══██╗██╔════╝██║   ██║╚══██╔══╝██╔═══██╗██╔═══██╗██║      |   |
         |   | ██║  ██║█████╗  ██║   ██║   ██║   ██║   ██║██║   ██║██║      |   |
         |   | ██║  ██║██╔══╝  ╚██╗ ██╔╝   ██║   ██║   ██║██║   ██║██║      |   |
         |   | ██████╔╝███████╗ ╚████╔╝    ██║   ╚██████╔╝╚██████╔╝███████╗ |   |
         |   | ╚═════╝ ╚══════╝  ╚═══╝     ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝ |   |
         |   |  Author: Marcel McHawk                                       |   |
         |   |  License: MIT                                                |   |
         |___|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|___|
        (_____)                                                            (_____)
        "
        );
    }
}

impl ConsoleLogger {
    pub fn new() -> Self {
        ConsoleLogger {
            log_histroy: Vec::new(),
        }
    }
}
