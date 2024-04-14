use term;
use std::io;
use std::io::prelude::*;
use term_size;

pub struct ConsoleLogger {
    pub log_histroy: Vec<String>,
}

pub trait LoggerFunctions {
    fn log_message(&mut self, message: &str, attributes: Vec<term::Attr>);
    fn log_message_no_linebreak(&mut self, message: &str,attributes: Vec<term::Attr>);
    fn log_error(&mut self, message: &str);
    fn log_break(&mut self);
    fn wait_for_input(&self);
    fn get_user_input(&self) -> String;
    fn log_title_page(&self);
}

impl LoggerFunctions for ConsoleLogger {
    fn log_message(&mut self, message: &str, attributes: Vec<term::Attr>) {
        let mut terminal = term::stdout().unwrap();
        for attr in attributes {
            terminal.attr(attr).unwrap();
        }

        println!("{}", message);
        // Adding the message to the log history.
        self.log_histroy.push(message.to_string());

        terminal.reset().unwrap();

    }

    fn log_message_no_linebreak(&mut self, message: &str, attributes: Vec<term::Attr>) {
        let mut terminal = term::stdout().unwrap();
        for attr in attributes {
            terminal.attr(attr).unwrap();
        }

        print!("{}", message);

        terminal.reset().unwrap();
    }

    fn log_error(&mut self, message: &str) {
        let mut terminal = term::stdout().unwrap();
        terminal.fg(term::color::BRIGHT_RED).unwrap();
        let error_msg  = format!("Error: {}", message);
        println!("{:?}", error_msg);
        self.log_histroy.push(error_msg);

        terminal.reset().unwrap();
    }

    fn log_break(&mut self) {
        println!("");
    }

    fn wait_for_input(&self) {
        let mut stdout = io::stdout();
        stdout.write(b"Press Enter to continue...").unwrap();
        stdout.flush().unwrap();
        io::stdin().read(&mut [0]).unwrap();

        if let Some((w, _)) = term_size::dimensions() {
            print!("\x1B[1A");

            for _ in 0..w {
                print!(" ");
            }

            println!("");
        }
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
        ConsoleLogger { log_histroy: Vec::new() }
    }
}