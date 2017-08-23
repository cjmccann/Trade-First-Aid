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

ActiveRecord::Schema.define(version: 20170822014022) do

  create_table "leagues", force: :cascade do |t|
    t.string "game_id"
    t.string "code"
    t.string "league_id"
    t.integer "manager_id"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.text "stat_settings"
    t.text "player_stats"
    t.text "team_stats"
    t.text "unsupported_categories"
    t.integer "week_updated"
    t.index ["user_id"], name: "index_leagues_on_user_id"
  end

  create_table "teams", force: :cascade do |t|
    t.string "name"
    t.integer "manager_id"
    t.boolean "imported"
    t.integer "league_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "icon_url"
    t.integer "user_id"
    t.text "rotoplayer_arr"
    t.text "player_metadata"
    t.index ["league_id"], name: "index_teams_on_league_id"
    t.index ["user_id"], name: "index_teams_on_user_id"
  end

  create_table "trades", force: :cascade do |t|
    t.text "players_in"
    t.text "players_out"
    t.integer "league_id"
    t.integer "user_id"
    t.integer "team_id"
    t.integer "partner"
    t.text "results"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["league_id"], name: "index_trades_on_league_id"
    t.index ["team_id"], name: "index_trades_on_team_id"
    t.index ["user_id"], name: "index_trades_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "provider"
    t.string "uid"
    t.string "username"
    t.text "token"
    t.string "expires_at"
    t.string "refresh_token"
    t.integer "favorite_team"
    t.string "icon_url"
    t.index ["email"], name: "index_users_on_email"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

end
