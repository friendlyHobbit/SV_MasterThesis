##### libraries ####
library(ggplot2)
library(ggpubr)
library(dplyr)
library(tidyr)
library(readr)
library(stringr)
library(gridExtra)
library(rstatix)
library(jsonlite)
library(purrr)


##### Import data ############################

# location of files 
data_dir <- "C:\\Git\\SV_MasterThesis\\analysis\\RealData"
#data_dir <- "H:\\git\\SV_MasterThesis\\data"

# get list of files in folder
files <- list.files(data_dir, full.names = TRUE)
files

i<-0
for(f in files){
  i<-i+1
  f_data <- fromJSON(f, flatten = TRUE)
  assign(paste("df", i, sep = "_"), f_data)
}

# only take performanceB
df1_performanceB <- df_1$performanceB
df2_performanceB <- df_2$performanceB
df3_performanceB <- df_3$performanceB
df4_performanceB <- df_4$performanceB
df5_performanceB <- df_5$performanceB

# only take dynamic and remove infopages
df1_performanceB <- subset(df1_performanceB, df1_performanceB$sessionType!="infoPage")
#df1_performanceB <- df1_performanceB %>% unnest(sessionData)
df2_performanceB <- subset(df2_performanceB, df2_performanceB$sessionType!="infoPage")
#df2_performanceB <- df3_performanceB %>% unnest(sessionData)
df3_performanceB <- subset(df3_performanceB, df3_performanceB$sessionType!="infoPage")
#df3_performanceB <- df3_performanceB %>% unnest(sessionData)
df4_performanceB <- subset(df4_performanceB, df4_performanceB$sessionType!="infoPage")
df5_performanceB <- subset(df5_performanceB, df5_performanceB$sessionType!="infoPage")



###### import participant data ################

# location of files 
participant_data_dir <- "C:\\Git\\SV_MasterThesis\\data"

participant_df <- read_csv(file.path(participant_data_dir, "results_8_32_72.csv"))
summary(participant_df)

# only take performanceB
participant_df <- subset(participant_df, test_phase=="performanceB")

unique_indexes <- unique(participant_df$session_index)
summary(unique_indexes)



###### Compare DFs #################

# take session index, uniqueChartState, uniqueChartIndex
participant_df2 <- subset(participant_df, select = c(session_index, unique_chart_index, unique_chart_state))
participant_df2 <- participant_df2 %>% 
  rename("sessionIndex" = "session_index",
         "uniqueChartIndex_participants" = "unique_chart_index",
         "uniqueChartState_participants" = "unique_chart_state")

df4_performanceB2 <- subset(df4_performanceB, select = c(sessionIndex, uniqueChartIndex, uniqueChartState))
df4_performanceB2 <- df4_performanceB2 %>% 
  rename("uniqueChartIndex_df1" = "uniqueChartIndex",
         "uniqueChartState_df1" = "uniqueChartState")

df5_performanceB2 <- subset(df5_performanceB, select = c(sessionIndex, uniqueChartIndex, uniqueChartState))
df5_performanceB2 <- df5_performanceB2 %>% 
  rename("uniqueChartIndex_df2" = "uniqueChartIndex",
         "uniqueChartState_df2" = "uniqueChartState")



min(df4_performanceB2$sessionIndex)
max(df4_performanceB2$sessionIndex)

min(df5_performanceB2$sessionIndex)
max(df5_performanceB2$sessionIndex)




# create sessionIndex 19 to 81 in all DF
df2_performanceB2 <- df2_performanceB2 %>% add_row(sessionIndex = 19:57)
df1_performanceB2 <- df1_performanceB2 %>% add_row(sessionIndex = 19)
df1_performanceB2 <- df1_performanceB2 %>% add_row(sessionIndex = 28:81)
df3_performanceB2 <- df3_performanceB2 %>% add_row(sessionIndex = 19:42)
df3_performanceB2 <- df3_performanceB2 %>% add_row(sessionIndex = 59:81)
participant_df2 <- participant_df2 %>% add_row(sessionIndex = 59:81)

# merge by session index
total1 <- merge(participant_df2, df4_performanceB2, by="sessionIndex")
total <- merge(total1, df5_performanceB2, by="sessionIndex") 
total <- total[!duplicated(total$sessionIndex), ]




