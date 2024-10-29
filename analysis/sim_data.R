
######### Load packages ###############

library(jsonlite)
library(dplyr)


######### import data ###########

# location of files 
data_dir <- "C:\\Git\\SV_MasterThesis\\data"

json_data <- fromJSON(file.path(data_dir, "data-real.json"), flatten = TRUE)

# subset data per phase
trainingA_df <- json_data[[1]]
trainingB_df <- json_data[[2]]
performanceA <- json_data[[3]]
performanceB <- json_data[[4]]

# only take dynamic
performanceA_df <- performanceA %>% filter(isDynamic == TRUE)
performanceB_df <- performanceB %>% filter(isDynamic == TRUE)


# unpack lists
testdf <- performanceB_df$sessionData[[1]]

testdf




performanceA_df$sessionData[3]

