##### libraries ####
library(ggplot2)
library(ggpubr)
library(dplyr)
library(tidyr)
library(readr)
library(stringr)
library(gridExtra)


##### Import data ############################

# location of files - Sita´s personal pc
data_dir <- "C:\\Git\\SV_MasterThesis\\data"
# location of files - Sita´s job pc

all_data_df <- read_csv(file.path(data_dir, "results_8_32_72.csv"))
summary(all_data_df)


# Data formatting 
# List of column names to convert to factors
columns_to_convert <- c("id", "participant_id", "computer_uuid", "chart_type", "data_source", 
                        "test_phase", "session_index", "session_type", "number_of_charts", "unique_chart_index",
                        "unique_chart_state", "participant_answer_index", "participant_answer_state")

all_data_df[,columns_to_convert] <- lapply(all_data_df[,columns_to_convert] , factor)

summary(all_data_df)



##### Subset relevant data only - static known ################

data_static_df <- all_data_df[all_data_df$is_dynamic == FALSE & all_data_df$test_phase == "performanceA", ]
summary(data_static_df)

# remove empty rows
data_static_df <- data_static_df[rowSums(is.na(data_static_df)) != ncol(data_static_df), ]


# calculating  accuracy
data_static_df$participant_answer_index <- as.numeric(data_static_df$participant_answer_index)
data_static_df$unique_chart_index <- as.numeric(data_static_df$unique_chart_index)

data_static_df$accuracy = ifelse(data_static_df$participant_answer_index == data_static_df$unique_chart_index, TRUE, FALSE) 

data_static_df$participant_answer_index <- as.factor(data_static_df$participant_answer_index)
data_static_df$unique_chart_index <- as.factor(data_static_df$unique_chart_index)




##### Descriptive statistics - RT #####################

# Calculating latency
data_static_df$RT <- data_static_df$click_time - data_static_df$user_ready_time
data_static_df$RT1 <- data_static_df$trigger_time - data_static_df$user_ready_time 
data_static_df$RT2 <- data_static_df$click_time - data_static_df$trigger_time 

summary(data_static_df$RT)
summary(data_static_df$RT1)
summary(data_static_df$RT2)



##### Descriptive statistics - accuracy

accuracy_table <- table(data_static_df$chart_type, data_static_df$accuracy, group=data_static_df$number_of_charts)
accuracy_table
