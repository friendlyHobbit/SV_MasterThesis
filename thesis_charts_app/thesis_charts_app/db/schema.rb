# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20190202000000) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "answers", force: :cascade do |t|
    t.integer "participant_id", null: false
    t.string "computer_uuid", null: false
    t.string "chart_type", null: false
    t.string "data_source", null: false
    t.string "test_phase", null: false
    t.integer "session_index", null: false
    t.string "session_type", null: false
    t.bigint "session_start_time", null: false
    t.integer "number_of_charts"
    t.boolean "is_dynamic"
    t.integer "transition_after"
    t.integer "unique_chart_index"
    t.integer "unique_chart_state"
    t.bigint "trigger_time"
    t.boolean "transition_started"
    t.bigint "click_time"
    t.integer "participant_answer_index"
    t.integer "participant_answer_state"
    t.jsonb "sequential_chart_answers"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
