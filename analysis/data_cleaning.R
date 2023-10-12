##### libraries ####
library(ggplot2)
library(ggpubr)
library(dplyr)
library(tidyr)
library(readr)
library(stringr)
library(gridExtra)
library(readxl)


##### import files #############################

# location of files - Sita´s personal pc
rawdata_dir <- "C:\\Git\\SV_MasterThesis\\raw data\\analysis"
# location of files - Sita´s job pc


# check data 8_32 - Good
data_8_32_df <- read_csv(file.path(rawdata_dir, "color_answers_v1.csv"))
summary(data_8_32_df)

unique(data_8_32_df$participant_id)
class(data_8_32_df$created_at)

# check demographics - good
data_demographics <- read_excel(file.path(rawdata_dir, "DemographicsData.xlsx"))
summary(data_demographics)

unique_dem <- unique(data_demographics$`Participant Number`)
unique_dem72 <- unique(data_demographics$`Participant Number - 72 charts`)


# check dataclip 72 - good
data_dc72_df <- read_csv(file.path(rawdata_dir, "dataclips_color72V1.csv"))
summary(data_dc72_df)

unique_dc72 <- unique(data_dc72_df$participant_id)

# check if unique(data_dc72_df$participant_id) == unique(data_demographics$`Participant Number - 72 charts`)
common_values <- unique_dc72[unique_dc72 %in% unique_dem72]
common_values



# from data_dc72_df only keep rows with p_id == common_values
data_72common_df <- data.frame()
data_72common_df <- data_dc72_df[data_dc72_df$participant_id %in% common_values, ]

data_72common_df$participant_id <- as.factor(data_72common_df$participant_id)
summary(data_72common_df$participant_id)




###### Clean data ###########################

data_72common_df$new_id <- c(0)

# compare participant ID from data_demographics with data_72common_df, change participant ID to same as in data_8_32
for(p in 1:nrow(data_demographics)){
  for(i in 1:nrow(data_72common_df)) { 
    if(data_72common_df$participant_id[i] == data_demographics$`Participant Number - 72 charts`[p]){
      print("same")
      data_72common_df$new_id[i] <- data_demographics$`Participant Number`[p] 
    } else{
      print("different")
    }
  }
}

# check if all went well
data_72common_df$new_id <- as.factor(data_72common_df$new_id)
summary(data_72common_df$participant_id)
summary(data_72common_df$new_id)
summary(data_72common_df)

# remove participant_id 
data_72_df <- subset(data_72common_df, select = -c(participant_id))
summary(data_72_df)

# rename new_id to participant_id in
colnames(data_72_df)[colnames(data_72_df) == "new_id"] = "participant_id"


##### combine DFs #############################

# check dfs first
data_8_32_df$participant_id <- as.factor(data_8_32_df$participant_id)
summary(data_8_32_df$participant_id)
summary(data_72_df$participant_id)

# combine
exp_data_df <- rbind(data_8_32_df, data_72_df)
summary(exp_data_df)


# participant 313833 has more data than others in data_8_32_df, check out 
check_p <- exp_data_df[exp_data_df$participant_id == 313833, ]
# create comparison participant - 313833 has 5 entries for session_index 0, 319200 has 2
compare_p <- exp_data_df[exp_data_df$participant_id == 319200, ]

# 313833 has 5 entries for session_index 0, 319200 has 2
summary(check_p$session_index)
summary(compare_p$session_index)


##### Calculate new variables ###################

# accuracy
exp_data_df$accuracy = ifelse(exp_data_df$participant_answer_state == exp_data_df$unique_chart_state, TRUE, FALSE) 

# check the data
check_df = subset(exp_data_df, select = c(chart_type,participant_answer_state,unique_chart_state,accuracy) )
# remove empty rows
check_df <- na.omit(check_df)
summary(check_df)


# reaction time
exp_data_df$RT <- exp_data_df$trigger_time - exp_data_df$user_ready_time  

# log tranform rt
exp_data_df$RT_log <- log(exp_data_df$RT)




##### Data cleaning #############################

# List of column names to convert to factors
#columns_to_convert <- c("id", "participant_id", "computer_uuid", "chart_type", "data_source", 
#                        "test_phase", "session_index", "session_type", "number_of_charts", "unique_chart_index",
#                        "unique_chart_state", "participant_answer_index", "participant_answer_state")

#exp_data_df[,columns_to_convert] <- lapply(exp_data_df[,columns_to_convert] , factor)

summary(exp_data_df)



#### Export data ##################################

write.csv(exp_data_df, file.path(rawdata_dir, "results_8_32_72.csv"), row.names=FALSE)

